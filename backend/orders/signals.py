from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils.timesince import timesince
from .models import Order
from web.models import Notification


@receiver(post_save, sender=Order, dispatch_uid='order_status_changed_signal')
def order_status_changed(sender, instance, **kwargs):
    channel_layer = get_channel_layer()

    # 1. Broadcast to the order tracking page (existing)
    async_to_sync(channel_layer.group_send)(
        f'order_{instance.id}',
        {
            'type': 'order_status_update',
            'message': {
                'id': instance.id,
                'status': str(instance.order_status) if instance.order_status else 'Pending',
                'updated_at': str(instance.updated_at),
            }
        }
    )

    # 2. Push notification to the customer's notification channel
    if instance.customer and instance.customer.user_id:
        user_id = instance.customer.user_id
        status_name = str(instance.order_status) if instance.order_status else 'Pending'

        # Create a persistent notification in the database
        notif = Notification.objects.create(
            user_id=user_id,
            type='order_update',
            title=f'Order #{instance.id} — {status_name}',
            message=f'Your order #{instance.id} is now "{status_name}".',
        )

        # Push it live via WebSocket
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
