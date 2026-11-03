import logging

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Order, OrderStatus, PaymentInfo
from .tasks import enqueue_after_commit, send_order_status_email_task
from notifications.services import notify, notify_staff

logger = logging.getLogger(__name__)


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

    # 1. Broadcast to the order tracking page
    if channel_layer:
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
            logger.warning('Order tracking broadcast failed', exc_info=True, extra={'order_id': instance.id})

    # Staff "new order" alerts are sent from OrderSerializer.create once items and totals are saved.

    # 2. Status update: email and notify the customer, only on a real change and never for a move back to pending
    if status_changed and instance.order_status and instance.order_status.status_code != OrderStatus.PENDING:
        enqueue_after_commit(send_order_status_email_task, instance.id)

        if instance.customer and instance.customer.user_id:
            status_name = str(instance.order_status)
            notify(
                instance.customer.user_id,
                type='order_update',
                title=f'Order #{instance.id} — {status_name}',
                message=f'Your order #{instance.id} is now "{status_name}".',
                link=f'/order-tracking/{instance.id}',
                data={'order_id': instance.id, 'status_code': instance.order_status.status_code},
            )


@receiver(pre_save, sender=PaymentInfo, dispatch_uid='payment_remember_previous_paid')
def remember_previous_paid(sender, instance, **kwargs):
    instance._was_paid = (
        PaymentInfo.objects.filter(pk=instance.pk).values_list('is_paid', flat=True).first()
        if instance.pk else False
    )


@receiver(post_save, sender=PaymentInfo, dispatch_uid='online_payment_received_notify')
def online_payment_received(sender, instance, **kwargs):
    """Online payment confirmed (SSLCommerz success or IPN). Fires once, on the unpaid -> paid change."""
    if not instance.is_paid or getattr(instance, '_was_paid', False) or instance.payment_method == 'cod':
        return
    order = Order.objects.filter(payment_info=instance).select_related('customer').first()
    if not order:
        return

    amount = instance.amount or order.total_amount
    notify_staff(
        'orders.view_order',
        type='payment',
        title='Payment received',
        message=f'Order #{order.id} was paid online (৳{amount}).',
        link=f'/orders?search={order.id}',
        data={'order_id': order.id, 'amount': str(amount), 'method': instance.payment_method},
    )
    if order.customer and order.customer.user_id:
        notify(
            order.customer.user_id,
            type='payment',
            title=f'Payment received for order #{order.id}',
            message=f'We received your payment of ৳{amount}. Thank you!',
            link=f'/order-tracking/{order.id}',
            data={'order_id': order.id, 'amount': str(amount)},
        )
