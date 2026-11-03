from datetime import timedelta
from io import StringIO

from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from django.contrib.auth.models import User, Permission
from django.core.management import call_command
from django.test import TestCase, TransactionTestCase, override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from notifications.routing import websocket_urlpatterns
from products.models import Brand, Category, Product
from reviews.models import Question, Review
from .models import ContactMessage, Notification, StoreConfiguration


class NotificationIsolationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.alice = User.objects.create_user(username='alice', password='password', email='alice@example.com')
        self.staff = User.objects.create_user(username='staff', password='password', email='staff@example.com', is_staff=True)
        self.alice_notif = Notification.objects.create(user=self.alice, title='Alice', message='hi')
        self.staff_notif = Notification.objects.create(user=self.staff, title='Staff', message='hi')

    def test_list_only_returns_own_notifications(self):
        for user, notif in ((self.alice, self.alice_notif), (self.staff, self.staff_notif)):
            self.client.force_authenticate(user=user)
            response = self.client.get('/notifications/')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual([n['id'] for n in response.data], [notif.id])

    def test_paginated_list_with_page_param(self):
        self.client.force_authenticate(user=self.alice)
        response = self.client.get('/notifications/?page=1')
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.alice_notif.id)

    def test_filter_by_type_in(self):
        Notification.objects.create(user=self.alice, type='new_order', title='Order', message='x')
        self.client.force_authenticate(user=self.alice)
        response = self.client.get('/notifications/?page=1&type__in=new_order,order_update')
        self.assertEqual([n['type'] for n in response.data['results']], ['new_order'])

    def test_cannot_mark_another_users_notification(self):
        self.client.force_authenticate(user=self.alice)
        response = self.client.post(f'/notifications/{self.staff_notif.id}/mark_read/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.staff_notif.refresh_from_db()
        self.assertFalse(self.staff_notif.is_read)

    def test_staff_bulk_actions_only_touch_own_notifications(self):
        self.client.force_authenticate(user=self.staff)
        self.client.post('/notifications/mark_all_read/')
        self.alice_notif.refresh_from_db()
        self.assertFalse(self.alice_notif.is_read)

        self.client.delete('/notifications/clear_all/')
        self.assertTrue(Notification.objects.filter(pk=self.alice_notif.pk).exists())
        self.assertFalse(Notification.objects.filter(pk=self.staff_notif.pk).exists())

    def test_unread_count(self):
        Notification.objects.create(user=self.alice, title='Read', message='x', is_read=True)
        self.client.force_authenticate(user=self.alice)
        response = self.client.get('/notifications/unread_count/')
        self.assertEqual(response.data, {'unread_count': 1})


class _ScopeUserMiddleware:
    """Injects a fixed user into the WebSocket scope (stands in for TokenAuthMiddleware)."""

    def __init__(self, inner, user):
        self.inner, self.user = inner, user

    async def __call__(self, scope, receive, send):
        return await self.inner({**scope, 'user': self.user}, receive, send)


@override_settings(CHANNEL_LAYERS={'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'}})
class NotificationSocketTest(TransactionTestCase):
    async def _connect(self, user, user_id):
        app = _ScopeUserMiddleware(URLRouter(websocket_urlpatterns), user)
        communicator = WebsocketCommunicator(app, f'/ws/notifications/{user_id}/')
        connected, _ = await communicator.connect()
        await communicator.disconnect()
        return connected

    async def test_owner_can_connect(self):
        user = User(id=7, username='owner')
        self.assertTrue(await self._connect(user, 7))

    async def test_other_users_group_is_rejected(self):
        user = User(id=7, username='owner')
        self.assertFalse(await self._connect(user, 8))


@override_settings(CHANNEL_LAYERS={'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'}})
class NotificationEventsTest(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(username='boss', password='password', email='boss@example.com')
        self.stock_clerk = User.objects.create_user(
            username='clerk', password='password', email='clerk@example.com', is_staff=True)
        self.stock_clerk.user_permissions.add(Permission.objects.get(codename='change_product'))
        self.shopper = User.objects.create_user(username='shopper', password='password', email='shop@example.com')

        config = StoreConfiguration.load()
        config.low_stock_threshold = 5
        config.save()

        category = Category.objects.create(name='Audio', slug='audio')
        brand = Brand.objects.create(name='Acme', slug='acme')
        self.product = Product.objects.create(
            name='Speaker', slug='speaker', price=150, stock_quantity=10, category=category, brand=brand)

    def _of_type(self, type, user=None):
        qs = Notification.objects.filter(type=type)
        return qs.filter(user=user) if user else qs

    def test_low_stock_alert_fires_once_when_crossing_threshold(self):
        self.product.stock_quantity = 6
        self.product.save()
        self.assertFalse(self._of_type('stock').exists())

        self.product.stock_quantity = 4
        self.product.save()
        self.assertEqual(
            set(self._of_type('stock').values_list('user', flat=True)), {self.admin.id, self.stock_clerk.id})

        # Still low: no repeat alert
        self.product.stock_quantity = 3
        self.product.save()
        self.assertEqual(self._of_type('stock', self.admin).count(), 1)

    def test_out_of_stock_variant_alert(self):
        variant = self.product.variants.create(ram=8, storage=128, color='Black', price=150, stock_quantity=8)
        variant.stock_quantity = 0
        variant.save()
        notif = self._of_type('stock', self.admin).get()
        self.assertEqual(notif.title, 'Out of stock')
        self.assertEqual(notif.data['variant_id'], variant.id)

    def test_new_review_notifies_staff(self):
        Review.objects.create(product=self.product, customer=self.shopper.customer, rating=4, comment='Nice')
        self.assertTrue(self._of_type('review', self.admin).exists())
        self.assertFalse(self._of_type('review', self.stock_clerk).exists())

    def test_question_flow(self):
        question = Question.objects.create(product=self.product, customer=self.shopper.customer, question='Waterproof?')
        self.assertTrue(self._of_type('review', self.admin).filter(link='/product-qna').exists())

        question.answer = 'Yes'
        question.save()
        question.answer = 'Yes, IPX7'
        question.save()
        answered = self._of_type('review', self.shopper)
        self.assertEqual(answered.count(), 1)
        self.assertEqual(answered.get().link, '/product/speaker')

    def test_contact_message_notifies_staff(self):
        ContactMessage.objects.create(name='Rita', email='rita@example.com', subject='Bulk order', message='Hi')
        notif = self._of_type('message', self.admin).get()
        self.assertIn('Bulk order', notif.message)


class PruneNotificationsTest(TestCase):
    def test_prunes_old_read_notifications_only(self):
        user = User.objects.create_user(username='old', password='password', email='old@example.com')
        old_read = Notification.objects.create(user=user, title='a', message='a', is_read=True)
        old_unread = Notification.objects.create(user=user, title='b', message='b')
        recent = Notification.objects.create(user=user, title='c', message='c', is_read=True)
        Notification.objects.filter(pk__in=[old_read.pk, old_unread.pk]).update(
            created_at=timezone.now() - timedelta(days=100))

        call_command('prune_notifications', '--days', '90', stdout=StringIO())
        self.assertEqual(set(Notification.objects.values_list('pk', flat=True)), {old_unread.pk, recent.pk})

        call_command('prune_notifications', '--days', '90', '--include-unread', stdout=StringIO())
        self.assertEqual(list(Notification.objects.values_list('pk', flat=True)), [recent.pk])
