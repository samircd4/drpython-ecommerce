from django.test import TestCase
from unittest.mock import patch
from django.test import override_settings
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from django.contrib.auth.models import User, Permission
from accounts.models import Address
from products.models import Product, Category, Brand
from web.models import Notification
from .models import Order, OrderStatus, PaymentInfo, Cart


class OrderAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create User & Customer
        self.user = User.objects.create_user(
            username='testuser', password='password', email='test@example.com')
        # Signal creates Customer automatically
        self.customer = self.user.customer
        self.customer.name = 'Test Customer'
        self.customer.save()

        self.client.force_authenticate(user=self.user)

        # Create Address
        self.address = Address.objects.create(
            customer=self.customer,
            full_name='Test Name',
            address='123 Test St',
            division='Dhaka',
            district='Dhaka City',
            sub_district='Dhanmondi',
            phone='1234567890'
        )

        # Create Product
        self.category = Category.objects.create(
            name='Electronics', slug='electronics')
        self.brand = Brand.objects.create(name='Sony', slug='sony')
        self.product = Product.objects.create(
            name='Headphones',
            slug='headphones',
            price=100.00,
            category=self.category,
            brand=self.brand
        )

    def test_create_order(self):
        url = '/api/orders/'
        data = {
            'items_input': [
                {'product_id': self.product.id, 'quantity': 2}
            ],
            'address_id': self.address.id
        }
        response = self.client.post(url, data, format='json')
        if response.status_code != status.HTTP_201_CREATED:
            print(response.data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(Order.objects.first().total_amount, 200.00)

    def test_list_orders(self):
        # Create a dummy order
        status_pending = OrderStatus.get_by_code(OrderStatus.PENDING)
        payment = PaymentInfo.objects.create()
        Order.objects.create(
            customer=self.customer,
            order_status=status_pending,
            payment_info=payment,
            total_amount=50.00
        )

        url = '/api/orders/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Handle pagination
        if 'results' in response.data:
            self.assertEqual(len(response.data['results']), 1)
        else:
            self.assertEqual(len(response.data), 1)

    def test_create_order_with_variant_items_input(self):
        # Create a product with a variant
        product = Product.objects.create(
            name='Phone X',
            slug='phone-x',
            category=self.category,
            brand=self.brand
        )
        variant = product.variants.create(
            ram=8, storage=256, color='Blue',
            price=299.99, stock_quantity=10
        )
        url = '/api/orders/'
        data = {
            'items_input': [
                {'variant_id': variant.id, 'quantity': 3}
            ],
            'address_id': self.address.id
        }
        response = self.client.post(url, data, format='json')
        if response.status_code != status.HTTP_201_CREATED:
            print("Order creation error:", response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        items = response.data.get('items', [])
        self.assertTrue(len(items) >= 1)
        first = items[0]
        self.assertIsNotNone(first.get('variant'))
        self.assertEqual(first['quantity'], 3)
        self.assertEqual(first['ram'], 8)
        self.assertEqual(first['storage'], 256)
        self.assertEqual(first['color'], 'Blue')


class CartAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='cartuser', password='password', email='cart@example.com')
        # Customer auto-created by signal
        self.customer = self.user.customer
        self.client.force_authenticate(user=self.user)

        # Create dependencies for product
        self.category = Category.objects.create(name='Misc', slug='misc')
        self.brand = Brand.objects.create(name='Generic', slug='generic')

    def test_create_cart(self):
        url = '/api/cart/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Authenticated user gets or creates a cart associated with user
        self.assertEqual(Cart.objects.count(), 1)
        self.assertEqual(Cart.objects.first().user, self.user)


class CartAnonAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create dependencies for product
        self.category = Category.objects.create(name='Misc', slug='misc')
        self.brand = Brand.objects.create(name='Generic', slug='generic')
        self.product = Product.objects.create(
            name='SimpleProd',
            slug='simpleprod',
            price=50.00,
            category=self.category,
            brand=self.brand
        )

    def test_anon_cart_add_product(self):
        # Initially list cart (should create a session-based cart)
        list_url = '/api/cart/'
        r1 = self.client.get(list_url)
        self.assertEqual(r1.status_code, status.HTTP_200_OK)
        self.assertEqual(Cart.objects.count(), 1)
        cart = Cart.objects.first()
        self.assertIsNone(cart.user)
        self.assertIsNotNone(cart.session_key)

        # Add product to cart
        create_url = '/api/cart/'
        payload = {'product_id': self.product.id, 'quantity': 2}
        r2 = self.client.post(create_url, payload, format='json')
        self.assertEqual(r2.status_code, status.HTTP_201_CREATED)

        # Confirm item present
        r3 = self.client.get(list_url)
        self.assertEqual(r3.status_code, status.HTTP_200_OK)
        self.assertTrue(len(r3.data.get('items', [])) >= 1)

    def test_anon_order_from_cart_with_variant(self):
        # Create product with variant
        product = Product.objects.create(
            name='Phone',
            slug='phone',
            category=self.category,
            brand=self.brand
        )
        variant = product.variants.create(
            ram=8, storage=128, color='Black',
            price=199.99, stock_quantity=5
        )

        # Ensure cart exists
        list_url = '/api/cart/'
        self.client.get(list_url)

        # Add variant to cart
        add_url = '/api/cart/'
        payload = {'variant_id': variant.id, 'quantity': 2}
        r_add = self.client.post(add_url, payload, format='json')
        self.assertEqual(r_add.status_code, status.HTTP_201_CREATED)

        # Create order from cart (guest fields required)
        order_url = '/api/orders/'
        order_payload = {
            'email': 'guest@example.com',
            'full_name': 'Guest User',
            'phone': '0123456789',
            'shipping_address': '123 Street',
            'division': 'Dhaka',
            'district': 'Dhaka',
        }
        r_order = self.client.post(order_url, order_payload, format='json')
        if r_order.status_code != status.HTTP_201_CREATED:
            print("Order creation error:", r_order.data)
        self.assertEqual(r_order.status_code, status.HTTP_201_CREATED)
        # Check items include variant details
        data = r_order.data
        items = data.get('items', [])
        self.assertTrue(len(items) >= 1)
        first = items[0]
        self.assertIsNotNone(first.get('variant'))
        self.assertEqual(first['quantity'], 2)
        self.assertEqual(first['ram'], 8)
        self.assertEqual(first['storage'], 128)
        self.assertEqual(first['color'], 'Black')


@override_settings(CHANNEL_LAYERS={'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'}})
class OrderStatusTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff = User.objects.create_superuser(
            username='admin', password='password', email='admin@example.com')
        self.client.force_authenticate(user=self.staff)
        self.order = Order.objects.create(
            full_name='Guest Buyer',
            email='buyer@example.com',
            order_status=OrderStatus.get_by_code(OrderStatus.PENDING),
            payment_info=PaymentInfo.objects.create(),
        )

    def test_canonical_statuses_seeded_in_order(self):
        codes = list(OrderStatus.objects.values_list('status_code', flat=True))
        self.assertEqual(codes, [code for code, _, _ in OrderStatus.CANONICAL])

    def test_order_response_includes_status_code(self):
        response = self.client.get(f'/orders/{self.order.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'Pending')
        self.assertEqual(response.data['status_code'], 'pending')

    def test_status_action_accepts_every_canonical_code(self):
        for code, display_name, _ in OrderStatus.CANONICAL:
            response = self.client.patch(f'/orders/{self.order.id}/status/', {'status': code}, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK, code)
            self.assertEqual(response.data['status_code'], code)
            self.order.refresh_from_db()
            self.assertEqual(self.order.order_status.display_name, display_name)

    def test_status_action_rejects_unknown_code(self):
        response = self.client.patch(f'/orders/{self.order.id}/status/', {'status': 'packed'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('orders.signals.send_order_status_email_task')
    def test_status_email_only_sent_when_status_changes(self, email_task):
        with self.captureOnCommitCallbacks(execute=True):
            self.order.order_status = OrderStatus.get_by_code(OrderStatus.SHIPPED)
            self.order.save()
        self.assertEqual(email_task.delay.call_count, 1)

        # Saving unrelated fields must not re-send the status email
        with self.captureOnCommitCallbacks(execute=True):
            self.order.full_name = 'Renamed Buyer'
            self.order.save()
            self.order.update_total_amount()
        self.assertEqual(email_task.delay.call_count, 1)

    @patch('orders.signals.send_order_status_email_task')
    def test_status_change_notifies_customer_once(self, email_task):
        customer_user = User.objects.create_user(username='buyer', password='password', email='buyer2@example.com')
        self.order.customer = customer_user.customer
        self.order.save()

        self.order.order_status = OrderStatus.get_by_code(OrderStatus.SHIPPED)
        self.order.save()
        self.order.save()

        notifs = Notification.objects.filter(user=customer_user, type='order_update')
        self.assertEqual(notifs.count(), 1)
        self.assertEqual(notifs.first().link, f'/order-tracking/{self.order.id}')


@override_settings(CHANNEL_LAYERS={'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'}})
class NewOrderNotificationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='shopper', password='password', email='s@example.com')
        self.client.force_authenticate(user=self.user)
        self.address = Address.objects.create(
            customer=self.user.customer, full_name='Shopper', address='1 Road', phone='01700000000',
        )
        category = Category.objects.create(name='Audio', slug='audio')
        brand = Brand.objects.create(name='Acme', slug='acme')
        self.product = Product.objects.create(name='Speaker', slug='speaker', price=150, category=category, brand=brand)

        self.admin = User.objects.create_superuser(username='boss', password='password', email='boss@example.com')
        self.order_viewer = User.objects.create_user(username='clerk', password='password', email='clerk@example.com', is_staff=True)
        self.order_viewer.user_permissions.add(Permission.objects.get(codename='view_order'))
        self.other_staff = User.objects.create_user(username='writer', password='password', email='writer@example.com', is_staff=True)

    @patch('orders.serializers.send_order_placed_email_task')
    def test_new_order_notifies_permitted_staff_with_final_total(self, email_task):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post('/orders/', {
                'items_input': [{'product_id': self.product.id, 'quantity': 2}],
                'address_id': self.address.id,
            }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        email_task.delay.assert_called_once()

        staff_notifs = Notification.objects.filter(type='new_order')
        self.assertEqual(set(staff_notifs.values_list('user', flat=True)), {self.admin.id, self.order_viewer.id})
        order = Order.objects.get()
        self.assertGreaterEqual(order.total_amount, Decimal('300.00'))  # final total, not the 0 seen in post_save
        self.assertEqual(Decimal(staff_notifs.first().data['amount']), order.total_amount)

        self.assertTrue(Notification.objects.filter(user=self.user, type='order_update').exists())


@override_settings(CHANNEL_LAYERS={'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'}})
class PaymentNotificationTest(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(username='boss', password='password', email='boss@example.com')
        self.buyer = User.objects.create_user(username='payer', password='password', email='payer@example.com')
        self.payment = PaymentInfo.objects.create(payment_method='sslcommerz', amount=Decimal('500.00'))
        self.order = Order.objects.create(
            customer=self.buyer.customer,
            order_status=OrderStatus.get_by_code(OrderStatus.PENDING),
            payment_info=self.payment,
        )

    def test_online_payment_notifies_once(self):
        self.payment.is_paid = True
        self.payment.save()
        # Success callback and IPN can both save the paid record
        self.payment.save()

        self.assertEqual(Notification.objects.filter(type='payment', user=self.admin).count(), 1)
        self.assertEqual(Notification.objects.filter(type='payment', user=self.buyer).count(), 1)

    def test_cod_marked_paid_does_not_notify(self):
        self.payment.payment_method = 'cod'
        self.payment.is_paid = True
        self.payment.save()
        self.assertFalse(Notification.objects.filter(type='payment').exists())

    def test_failed_payment_notifies_customer(self):
        self.client.get('/payment/sslcommerz/fail/', {'value_a': str(self.order.id)})
        notif = Notification.objects.get(type='payment', user=self.buyer)
        self.assertIn('failed', notif.title)
