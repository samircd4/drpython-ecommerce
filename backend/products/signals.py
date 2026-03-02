from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Product, ProductVariant

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
