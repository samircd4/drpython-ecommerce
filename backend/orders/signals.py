from django.db.models import Q
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils.timesince import timesince
from .models import Order, OrderStatus
from django.contrib.auth import get_user_model
from web.models import Notification
from utils.emails import send_order_placed_email, send_order_status_update_email

User = get_user_model()


@receiver(pre_save, sender=Order, dispatch_uid='order_remember_previous_status')
def remember_previous_status(sender, instance, **kwargs):
    """Remember the stored status so post_save can tell whether it actually changed."""
    if instance.pk:
        instance._previous_status_id = (
            Order.objects.filter(pk=instance.pk).values_list('order_status_id', flat=True).first()
        )
    else:
        instance._previous_status_id = None


@receiver(post_save, sender=Order, dispatch_uid='order_status_changed_signal')
def order_status_changed(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    status_changed = (
        not kwargs.get('created', False)
        and instance.order_status_id != getattr(instance, '_previous_status_id', None)
    )

    # 1. Broadcast to the order tracking page (existing)
    try:
        async_to_sync(channel_layer.group_send)(
            f'order_{instance.id}',
            {
                'type': 'order_status_update',
                'message': {
                    'id': instance.id,
                    'status': str(instance.order_status) if instance.order_status else 'Pending',
                    'status_code': instance.order_status.status_code if instance.order_status else OrderStatus.PENDING,
                    'updated_at': str(instance.updated_at),
                }
            }
        )
    except Exception:
        pass

    # 2. Notify Admins on New Order
    if kwargs.get('created', False):
        # Notify all staff and superusers
        admins = User.objects.filter(Q(is_staff=True) | Q(is_superuser=True))
        
        if not channel_layer:
            return

        for admin in admins:
            group_name = f'notifications_{admin.id}'
            try:
                # Send live WebSocket notification
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        'type': 'send_notification',
                        'notification': {
                            'id': f"new_order_{instance.id}_{int(instance.created_at.timestamp())}", 
                            'type': 'new_order',
                            'title': 'New Order Received',
                            'message': f'Order #{instance.id} from {instance.full_name or "Guest"}',
                            'order_id': instance.id,
                            'customer': instance.full_name or "Guest",
                            'amount': str(instance.total_amount),
                            'time': str(instance.created_at),
                            'is_read': False
                        }
                    }
                )
            except Exception:
                pass

    # 3. Status Update Notifications
    if status_changed:
        # Only notify when the status actually changed (not on every save), and never for a move back to pending
        if instance.order_status and instance.order_status.status_code != OrderStatus.PENDING:
            send_order_status_update_email(instance)

            # Push notification for status updates
            if instance.customer and instance.customer.user_id:
                user_id = instance.customer.user_id
                status_name = str(instance.order_status) if instance.order_status else 'Updated'

                # Create a persistent notification in the database
                notif = Notification.objects.create(
                    user_id=user_id,
                    type='order_update',
                    title=f'Order #{instance.id} — {status_name}',
                    message=f'Your order #{instance.id} is now "{status_name}".',
                    link=f'/order-tracking/{instance.id}'
                )

                # Push it live via WebSocket
                try:
                    async_to_sync(channel_layer.group_send)(
                        f'notifications_{user_id}',
                        {
                            'type': 'send_notification',
                            'notification': {
                                'id': notif.id,
                                'type': notif.type,
                                'title': notif.title,
                                'message': notif.message,
                                'time': 'Just now',
                                'is_read': False,
                            }
                        }
                    )
                except Exception:
                    pass
