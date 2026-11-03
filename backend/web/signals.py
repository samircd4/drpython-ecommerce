from django.db.models.signals import post_save
from django.dispatch import receiver

from notifications.services import notify_staff
from .models import ContactMessage


@receiver(post_save, sender=ContactMessage, dispatch_uid='contact_message_notify_staff')
def contact_message_received(sender, instance, created, **kwargs):
    if not created:
        return
    # Same permission that gates the admin Contact Messages page
    notify_staff(
        'accounts.view_customer',
        type='message',
        title='New contact message',
        message=f'{instance.name}: {instance.subject or instance.message[:80]}',
        link='/contact-messages',
        data={'contact_message_id': instance.id, 'email': instance.email},
    )
