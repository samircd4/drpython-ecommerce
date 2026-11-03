"""
Single entry point for creating notifications.

Every notification is stored in `web.Notification` and then pushed to the
user's `notifications_<user_id>` WebSocket group after the surrounding
transaction commits, so clients never receive an id that is rolled back.
"""
import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q

from web.models import Notification
from web.serializers import NotificationSerializer

logger = logging.getLogger(__name__)
User = get_user_model()


def _push(notifications):
    channel_layer = get_channel_layer()
    if not channel_layer:
        return
    for notif in notifications:
        try:
            async_to_sync(channel_layer.group_send)(
                f'notifications_{notif.user_id}',
                {'type': 'send_notification', 'notification': NotificationSerializer(notif).data},
            )
        except Exception:
            logger.warning('Notification push failed', exc_info=True, extra={'notification_id': notif.id})


def _create_and_push(user_ids, type, title, message, link=None, data=None):
    notifications = Notification.objects.bulk_create([
        Notification(user_id=user_id, type=type, title=title, message=message, link=link, data=data or {})
        for user_id in user_ids
    ])
    transaction.on_commit(lambda: _push(notifications))
    return notifications


def notify(user, type, title, message, link=None, data=None):
    """Create a notification for one user (User instance or id) and push it live."""
    user_id = getattr(user, 'pk', user)
    if not user_id:
        return None
    return _create_and_push([user_id], type, title, message, link, data)[0]


def staff_recipients(perm=None):
    """Active staff who hold `perm` (e.g. 'orders.view_order'), plus all superusers."""
    staff = User.objects.filter(is_active=True, is_staff=True)
    if perm:
        app_label, codename = perm.split('.', 1)
        staff = staff.filter(
            Q(is_superuser=True)
            | Q(user_permissions__content_type__app_label=app_label, user_permissions__codename=codename)
            | Q(groups__permissions__content_type__app_label=app_label, groups__permissions__codename=codename)
        )
    superusers = User.objects.filter(is_active=True, is_superuser=True)
    return (staff | superusers).distinct()


def notify_staff(perm, type, title, message, link=None, data=None):
    """Create a notification for every staff member allowed to act on it."""
    user_ids = list(staff_recipients(perm).values_list('pk', flat=True))
    if not user_ids:
        return []
    return _create_and_push(user_ids, type, title, message, link, data)
