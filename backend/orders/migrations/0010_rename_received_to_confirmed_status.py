from django.db import migrations


def add_confirmed_status(apps, schema_editor):
    OrderStatus = apps.get_model('orders', 'OrderStatus')
    # Rename 'Received' to 'Confirmed' if it exists
    received = OrderStatus.objects.filter(display_name__iexact='Received').first()
    if received:
        received.display_name = 'Confirmed'
        received.status_code = 'confirmed'
        received.save()
    else:
        # Create Confirmed if it doesn't exist
        OrderStatus.objects.get_or_create(
            status_code='confirmed',
            defaults={'display_name': 'Confirmed', 'description': 'Order confirmed by admin'}
        )


def reverse_migration(apps, schema_editor):
    OrderStatus = apps.get_model('orders', 'OrderStatus')
    confirmed = OrderStatus.objects.filter(display_name__iexact='Confirmed').first()
    if confirmed:
        confirmed.display_name = 'Received'
        confirmed.status_code = 'received'
        confirmed.save()


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0009_coupon_order_coupon'),
    ]

    operations = [
        migrations.RunPython(add_confirmed_status, reverse_migration),
    ]
