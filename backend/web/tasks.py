from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.utils import timezone

from .models import Notification


def prune_notifications(days=None, include_unread=False):
    """Delete notifications older than `days`. Unread ones are kept unless include_unread. Returns the count."""
    days = settings.NOTIFICATION_RETENTION_DAYS if days is None else days
    old = Notification.objects.filter(created_at__lt=timezone.now() - timedelta(days=days))
    if not include_unread:
        old = old.filter(is_read=True)
    deleted, _ = old.delete()
    return deleted


@shared_task
def prune_notifications_task():
    return prune_notifications()
