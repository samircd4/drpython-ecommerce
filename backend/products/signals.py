from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Product, ProductVariant
from notifications.services import notify_staff

@receiver(post_save, sender=Product)
def product_status_changed(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'product_{instance.id}',
        {
            'type': 'product_update',
            'message': {
                'id': instance.id,
                'name': instance.name,
                'price': str(instance.price),
                'discount_price': str(instance.discount_price) if instance.discount_price else None,
                'stock': instance.stock_quantity,
                'is_active': instance.is_active,
            }
        }
    )

@receiver(post_save, sender=ProductVariant)
def variant_status_changed(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    # Also notify the main product group when a variant changes
    async_to_sync(channel_layer.group_send)(
        f'product_{instance.product.id}',
        {
            'type': 'product_update',
            'message': {
                'variant_id': instance.id,
                'variant_name': str(instance),
                'variant_price': str(instance.price) if instance.price else str(instance.product.price),
                'variant_stock': instance.stock_quantity,
            }
        }
    )


# ---------------------------------------------------------------------------
# Low-stock alerts: notify staff once, when stock crosses the threshold downwards
# ---------------------------------------------------------------------------

@receiver(pre_save, sender=Product, dispatch_uid='product_remember_previous_stock')
@receiver(pre_save, sender=ProductVariant, dispatch_uid='variant_remember_previous_stock')
def remember_previous_stock(sender, instance, **kwargs):
    instance._previous_stock = (
        sender.objects.filter(pk=instance.pk).values_list('stock_quantity', flat=True).first()
        if instance.pk else None
    )


def _crossed_low_stock(instance):
    from web.models import StoreConfiguration

    previous = getattr(instance, '_previous_stock', None)
    current = instance.stock_quantity
    if previous is None or not isinstance(current, int):
        return False
    threshold = StoreConfiguration.load().low_stock_threshold
    return previous > threshold >= current


@receiver(post_save, sender=Product, dispatch_uid='product_low_stock_alert')
def product_low_stock_alert(sender, instance, created, **kwargs):
    if created or not instance.is_active or not _crossed_low_stock(instance):
        return
    _notify_low_stock(instance.name, instance.stock_quantity, instance.id, {'product_id': instance.id})


@receiver(post_save, sender=ProductVariant, dispatch_uid='variant_low_stock_alert')
def variant_low_stock_alert(sender, instance, created, **kwargs):
    if created or not instance.is_active or not _crossed_low_stock(instance):
        return
    _notify_low_stock(
        str(instance), instance.stock_quantity, instance.product_id,
        {'product_id': instance.product_id, 'variant_id': instance.id},
    )


def _notify_low_stock(name, stock, product_id, data):
    out = stock == 0
    notify_staff(
        'products.change_product',
        type='stock',
        title='Out of stock' if out else 'Low stock',
        message=f'{name} is out of stock.' if out else f'{name} has only {stock} left in stock.',
        link=f'/products/edit/{product_id}',
        data={**data, 'stock': stock},
    )
