from django.conf import settings
from django.core.management.base import BaseCommand

from web.tasks import prune_notifications


class Command(BaseCommand):
    help = "Delete old notifications (read ones only, unless --include-unread)."

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=settings.NOTIFICATION_RETENTION_DAYS,
                            help='Delete notifications older than this many days.')
        parser.add_argument('--include-unread', action='store_true',
                            help='Also delete old notifications that were never read.')

    def handle(self, *args, **options):
        deleted = prune_notifications(options['days'], options['include_unread'])
        self.stdout.write(self.style.SUCCESS(f'Deleted {deleted} notification(s).'))
