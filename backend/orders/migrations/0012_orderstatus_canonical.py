from django.db import migrations, models

# Frozen copy of OrderStatus.CANONICAL at the time of this migration.
CANONICAL = [
    ('pending', 'Pending', 'Order placed, awaiting confirmation'),
    ('confirmed', 'Confirmed', 'Order confirmed by the shop'),
    ('processing', 'Processing', 'Order is being prepared and packed'),
    ('shipped', 'Shipped', 'Order handed to the courier'),
    ('delivered', 'Delivered', 'Order delivered to the customer'),
    ('cancelled', 'Cancelled', 'Order was cancelled'),
    ('returned', 'Returned', 'Order was returned by the customer'),
]

# Legacy codes found in older data, folded into their canonical equivalent.
LEGACY = {
    'received': 'confirmed',
    'completed': 'delivered',
    'canceled': 'cancelled',
}


def sync_statuses(apps, schema_editor):
    OrderStatus = apps.get_model('orders', 'OrderStatus')
    Order = apps.get_model('orders', 'Order')

    for index, (code, display_name, description) in enumerate(CANONICAL):
        OrderStatus.objects.update_or_create(
            status_code=code,
            defaults={'display_name': display_name, 'description': description, 'sort_order': index},
        )

    for legacy_code, canonical_code in LEGACY.items():
        legacy = OrderStatus.objects.filter(status_code=legacy_code).first()
        if legacy:
            canonical = OrderStatus.objects.get(status_code=canonical_code)
            Order.objects.filter(order_status=legacy).update(order_status=canonical)
            legacy.delete()

    # Any other custom statuses sort after the canonical ones.
    OrderStatus.objects.exclude(status_code__in=[c[0] for c in CANONICAL]).update(sort_order=100)

    # Orders without a status are treated as pending everywhere, so make it explicit.
    pending = OrderStatus.objects.get(status_code='pending')
    Order.objects.filter(order_status__isnull=True).update(order_status=pending)


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0011_alter_orderitem_product_alter_orderitem_variant'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='orderstatus',
            options={'ordering': ['sort_order', 'id'], 'verbose_name_plural': 'Order statuses'},
        ),
        migrations.AddField(
            model_name='orderstatus',
            name='sort_order',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.RunPython(sync_statuses, migrations.RunPython.noop),
    ]
