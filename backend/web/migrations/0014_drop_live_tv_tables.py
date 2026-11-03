from django.db import migrations


def remove_live_tv_metadata(apps, schema_editor):
    """Clean up content types (and their permissions) and migration history left by the removed live_tv app."""
    ContentType = apps.get_model('contenttypes', 'ContentType')
    ContentType.objects.filter(app_label='live_tv').delete()
    schema_editor.execute("DELETE FROM django_migrations WHERE app = 'live_tv'")


class Migration(migrations.Migration):

    dependencies = [
        ('web', '0013_remove_storeconfiguration_stripe_public_key_and_more'),
        ('contenttypes', '0002_remove_content_type_name'),
    ]

    operations = [
        # Channel references Country and Category, so drop it first.
        migrations.RunSQL(
            sql=[
                'DROP TABLE IF EXISTS live_tv_channel',
                'DROP TABLE IF EXISTS live_tv_category',
                'DROP TABLE IF EXISTS live_tv_country',
            ],
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.RunPython(remove_live_tv_metadata, migrations.RunPython.noop),
    ]
