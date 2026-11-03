import logging

from celery import shared_task
from django.db import transaction

from utils.emails import send_order_placed_email, send_order_status_update_email

logger = logging.getLogger(__name__)


def _load_order(order_id):
    from .models import Order
    return (
        Order.objects.select_related('order_status', 'customer__user')
        .prefetch_related('items')
        .filter(pk=order_id)
        .first()
    )


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_order_placed_email_task(self, order_id):
    order = _load_order(order_id)
    if order and not send_order_placed_email(order):
        raise self.retry()


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_order_status_email_task(self, order_id):
    order = _load_order(order_id)
    if order and not send_order_status_update_email(order):
        raise self.retry()


def enqueue_after_commit(task, *args):
    """Queue a Celery task once the current transaction commits.

    If the broker is unreachable (e.g. running without Redis locally), run it inline
    so the email is still sent.
    """
    def _send():
        try:
            task.delay(*args)
        except Exception:
            logger.warning('Celery unavailable, running %s inline', task.name, exc_info=True)
            try:
                task.apply(args=args)
            except Exception:
                logger.exception('Inline task %s failed', task.name)

    transaction.on_commit(_send)
