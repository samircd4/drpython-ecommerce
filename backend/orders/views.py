from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from decimal import Decimal

from .models import Order, Cart, Checkout, CartItem, OrderStatus, Coupon, PaymentInfo
from .serializers import OrderSerializer, CartSerializer, CheckoutSerializer, CartItemSerializer, CouponSerializer, PaymentInfoSerializer

import logging
from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from utils.pdf import generate_invoice_pdf

logger = logging.getLogger(__name__)

from api.permissions import StaffHasActionPermission

@extend_schema(tags=['Orders'])
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['order_status__status_code', 'payment_info__is_paid']
    ordering_fields = ['created_at', 'total_amount']

    # --------------------
    # Permissions
    # --------------------
    def get_permissions(self):
        if self.action in ['create', 'validate_coupon', 'initiate_payment']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), StaffHasActionPermission()]

    # --------------------
    # Queryset
    # --------------------
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Order.objects.none()

        if not self.request.user.is_authenticated:
            return Order.objects.none()

        if self.request.user.is_staff:
            return Order.objects.all()

        if hasattr(self.request.user, 'customer'):
            return Order.objects.filter(customer=self.request.user.customer)

        return Order.objects.none()

    # --------------------
    # Validate Coupon
    # --------------------
    @action(detail=False, methods=['post'], url_path='validate-coupon', permission_classes=[permissions.AllowAny], authentication_classes=[])
    def validate_coupon(self, request):
        code = request.data.get('code')
        subtotal = request.data.get('subtotal')

        if not code:
            return Response({"detail": "Coupon code is required."}, status=status.HTTP_400_BAD_REQUEST)

        coupon = Coupon.objects.filter(code__iexact=code).first()
        if not coupon:
            return Response({"detail": "Invalid coupon code."}, status=status.HTTP_404_NOT_FOUND)

        try:
            subtotal_dec = Decimal(str(subtotal)) if subtotal else Decimal('0.00')
        except:
            subtotal_dec = Decimal('0.00')

        is_valid, message = coupon.is_valid(subtotal_dec)
        if not is_valid:
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)

        discount_amount = coupon.calculate_discount(subtotal_dec)

        return Response({
            "code": coupon.code,
            "discount_type": coupon.discount_type,
            "discount_value": coupon.discount_value,
            "discount_amount": discount_amount,
            "message": "Coupon applied successfully!"
        })

    # --------------------
    # Initiate Payment (for unpaid / retry orders)
    # --------------------
    @action(detail=True, methods=['post'], url_path='initiate-payment', permission_classes=[permissions.AllowAny], authentication_classes=[])
    def initiate_payment(self, request, pk=None):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.payment_info and order.payment_info.is_paid:
            return Response({"detail": "Order is already paid."}, status=status.HTTP_400_BAD_REQUEST)

        from .sslcommerz import SSLCommerzClient
        client = SSLCommerzClient()
        res = client.initiate_payment(order, request=request)
        if res.get('success'):
            return Response(res, status=status.HTTP_200_OK)
        return Response({"detail": res.get('message', 'Failed to initiate payment.')}, status=status.HTTP_400_BAD_REQUEST)
    @extend_schema(
        summary="Create Order",
        description="""
        Create a new order.
        
        **For Authenticated Users:**
        - Can use existing saved address via `address_id` OR provide new address details.
        
        **For Guest Users:**
        - Must provide all address fields: `email`, `full_name`, `phone`,
          `shipping_address`, `division`, `district`.
        """,
        responses={201: OrderSerializer}
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    # --------------------
    # Update Order Status
    # --------------------
    @extend_schema(
        summary="Update Order Status",
        request=None,
        parameters=[
            OpenApiParameter(
                "status",
                OpenApiTypes.STR,
                description="Status Code",
                required=True
            )
        ],
        responses={200: OpenApiTypes.OBJECT}
    )
    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        order = self.get_object()
        status_code = request.data.get('status')

        if not status_code:
            return Response(
                {'error': 'status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            new_status = OrderStatus.objects.get(status_code=status_code)
            order.order_status = new_status
            order.save()

            return Response({
                'status': 'updated',
                'new_status': new_status.display_name
            })
        except OrderStatus.DoesNotExist:
            return Response(
                {'error': 'Invalid status code'},
                status=status.HTTP_400_BAD_REQUEST
            )

    # --------------------
    # 🔥 Invoice PDF Action
    # --------------------
    @extend_schema(
        tags=['pdf_generator'],
        summary="Download Order Invoice (PDF)",
        description="Generate and download invoice PDF for this order",
        responses={200: OpenApiTypes.BINARY}
    )
    @action(detail=True, methods=['get'], url_path='invoice')
    def invoice(self, request, pk=None):
        order = self.get_object()

        # 🔐 HARD SECURITY CHECK (no loopholes)
        if not request.user.is_staff:
            # User must own the order
            if not hasattr(request.user, 'customer'):
                return Response(
                    {'detail': 'You are not allowed to access this invoice.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            if order.customer != request.user.customer:
                return Response(
                    {'detail': 'You are not allowed to access this invoice.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        pdf = generate_invoice_pdf(order)

        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = (
            f'attachment; filename="invoice_{order.id}.pdf"'
        )

        return response


@extend_schema(tags=['Cart'])
class CartViewSet(viewsets.ModelViewSet):
    """
    Manage Shopping Cart.
    Routes:
    GET /api/cart/ -> Returns the User's Cart (with items)
    POST /api/cart/ -> Add Item to Cart
    PUT /api/cart/{id}/ -> Update Item Quantity
    DELETE /api/cart/{id}/ -> Remove Item
    DELETE /api/cart/clear/ -> Clear Cart
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = CartItemSerializer

    def _get_cart(self, request):
        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            return cart
        # Ensure session exists
        if not request.session.session_key:
            request.session.create()
        cart, _ = Cart.objects.get_or_create(
            session_key=request.session.session_key)
        return cart

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return CartItem.objects.none()
        if self.request.user.is_authenticated:
            return CartItem.objects.filter(cart__user=self.request.user)
        # Ensure session exists
        if not self.request.session.session_key:
            self.request.session.create()
        return CartItem.objects.filter(cart__session_key=self.request.session.session_key)

    @extend_schema(
        summary="Get Cart",
        description="Returns the User's Cart (with items)",
        responses={200: CartSerializer}
    )
    def list(self, request, *args, **kwargs):
        cart = self._get_cart(request)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @extend_schema(
        summary="Add Item to Cart",
        description="Add an item to the cart or update quantity if it exists.",
        responses={201: CartItemSerializer}
    )
    def create(self, request, *args, **kwargs):
        cart = self._get_cart(request)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data.get('product')
        variant = serializer.validated_data.get('variant')
        quantity = serializer.validated_data['quantity']

        # Check if item exists
        if variant:
            item, created = CartItem.objects.get_or_create(
                cart=cart, product=variant.product, variant=variant,
                defaults={'quantity': quantity}
            )
        else:
            # If product has variants but none specified, pick a default active variant (min price)
            default_variant = None
            if product and product.variants.exists():
                default_variant = product.variants.filter(
                    is_active=True).order_by('price').first()
            if default_variant:
                item, created = CartItem.objects.get_or_create(
                    cart=cart, product=product, variant=default_variant,
                    defaults={'quantity': quantity}
                )
            else:
                item, created = CartItem.objects.get_or_create(
                    cart=cart, product=product,
                    defaults={'quantity': quantity}
                )

        if not created:
            item.quantity += quantity
            item.save()

        # Return the updated item
        return Response(self.get_serializer(item).data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Clear Cart",
        description="Remove all items from the cart.",
        responses={204: None}
    )
    @action(detail=False, methods=['delete'])
    def clear(self, request):
        cart = self._get_cart(request)
        cart.items.all().delete()
        return Response({'status': 'cart cleared'}, status=status.HTTP_204_NO_CONTENT)


@extend_schema(tags=['Cart Items'])
class CartItemViewSet(viewsets.ModelViewSet):
    """
    Manage Cart Items:
    - GET /api/cart-items/ : List all items in cart
    - POST /api/cart-items/ : Add item to cart
    - GET /api/cart-items/{id}/ : Retrieve specific item
    - PATCH /api/cart-items/{id}/ : Update quantity
    - DELETE /api/cart-items/{id}/ : Remove item from cart
    """
    serializer_class = CartItemSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']

    def _get_cart(self, request):
        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            return cart
        if not request.session.session_key:
            request.session.create()
        cart, _ = Cart.objects.get_or_create(
            session_key=request.session.session_key)
        return cart

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return CartItem.objects.none()
        if self.request.user.is_authenticated:
            return CartItem.objects.filter(cart__user=self.request.user)
        if not self.request.session.session_key:
            self.request.session.create()
        return CartItem.objects.filter(cart__session_key=self.request.session.session_key)

    def perform_create(self, serializer):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        product = serializer.validated_data['product']
        quantity = serializer.validated_data.get('quantity', 1)

        # Check if item exists
        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            item.quantity += quantity
            item.save()
            # We need to update the serializer instance to point to the updated item
            # But perform_create doesn't return response.
            # We can't easily swap the instance here for the response.
            # However, ModelViewSet calls serializer.save() which calls perform_create.
            # We can override create() instead.
            pass

    def create(self, request, *args, **kwargs):
        cart = self._get_cart(request)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data.get('product')
        variant = serializer.validated_data.get('variant')
        quantity = serializer.validated_data['quantity']

        # Check if item exists
        if variant:
            item, created = CartItem.objects.get_or_create(
                cart=cart, product=variant.product, variant=variant,
                defaults={'quantity': quantity}
            )
        else:
            # If product has variants but none specified, pick a default active variant (min price)
            default_variant = None
            if product and product.variants.exists():
                default_variant = product.variants.filter(
                    is_active=True).order_by('price').first()
            if default_variant:
                item, created = CartItem.objects.get_or_create(
                    cart=cart, product=product, variant=default_variant,
                    defaults={'quantity': quantity}
                )
            else:
                item, created = CartItem.objects.get_or_create(
                    cart=cart, product=product,
                    defaults={'quantity': quantity}
                )

        if not created:
            item.quantity += quantity
            item.save()

        # Return the updated/created item
        return Response(self.get_serializer(item).data, status=status.HTTP_201_CREATED)


@extend_schema(tags=['Checkout'])
class CheckoutViewSet(viewsets.ModelViewSet):
    serializer_class = CheckoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Checkout.objects.none()
        return Checkout.objects.filter(cart__user=self.request.user)


@extend_schema(tags=['Payments'])
class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Payment Info.
    """
    queryset = PaymentInfo.objects.all()
    serializer_class = PaymentInfoSerializer
    permission_classes = [permissions.IsAuthenticated, StaffHasActionPermission]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['is_paid', 'payment_method']
    search_fields = ['transaction_id', 'paid_from']
    ordering_fields = ['created_at', 'payment_date', 'amount']

    def get_queryset(self):
        if self.request.user.is_staff:
            return PaymentInfo.objects.all().order_by('-created_at')
        # For regular users, they might only see payments related to their orders
        if hasattr(self.request.user, 'customer'):
            return PaymentInfo.objects.filter(order__customer=self.request.user.customer).order_by('-created_at')
        return PaymentInfo.objects.none()


@extend_schema(tags=['Coupons'])
class CouponViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Coupons (Admin only).
    """
    queryset = Coupon.objects.all().order_by('-created_at')
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['active', 'discount_type']
    search_fields = ['code']
    ordering_fields = ['created_at', 'valid_from', 'valid_to', 'discount_value']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser(), StaffHasActionPermission()]


# =============================================================
# SSLCOMMERZ CALLBACK VIEWS
# =============================================================

def _get_ssl_params(request):
    """
    SSLCommerz POSTs payment data to these endpoints.
    Helper to safely read params from POST (and fall back to GET for resilience).
    """
    data = request.POST if request.method == 'POST' else request.GET
    return data


@csrf_exempt
def sslcommerz_success_view(request):
    """
    Handles callback from SSLCommerz on successful payment.
    SSLCommerz POSTs to this URL; it validates payment and redirects to frontend.
    Accepts both POST (SSLCommerz server callback) and GET (browser redirect fallback).
    """
    data = _get_ssl_params(request)

    val_id = data.get('val_id')
    tran_id = data.get('tran_id')
    card_type = data.get('card_type')
    bank_tran_id = data.get('bank_tran_id')
    amount_str = data.get('amount')
    value_a = data.get('value_a')

    frontend_url = settings.FRONTEND_URL.rstrip('/')

    order = None
    if tran_id:
        order = Order.objects.filter(payment_info__transaction_id=tran_id).first()
    if not order and value_a and value_a.isdigit():
        order = Order.objects.filter(id=int(value_a)).first()
    if not order and tran_id and tran_id.startswith('ORD'):
        try:
            order_id_part = tran_id.split('-')[0].replace('ORD', '')
            order = Order.objects.filter(id=int(order_id_part)).first()
        except Exception:
            pass

    if not order:
        logger.error(f"SSLCommerz success received for unknown order. tran_id: {tran_id}, val_id: {val_id}")
        return HttpResponseRedirect(f"{frontend_url}/payment/failed?reason=order_not_found")

    from .sslcommerz import SSLCommerzClient
    client = SSLCommerzClient()
    validated_data = client.validate_payment(val_id) if val_id else None

    if validated_data:
        if order.payment_info:
            order.payment_info.is_paid = True
            order.payment_info.payment_method = 'sslcommerz'
            order.payment_info.transaction_id = bank_tran_id or tran_id
            order.payment_info.paid_from = card_type or validated_data.get('card_type', 'SSLCommerz')
            try:
                order.payment_info.amount = Decimal(str(validated_data.get('amount', amount_str or order.grand_total)))
            except Exception:
                pass
            order.payment_info.payment_date = timezone.now()
            order.payment_info.save()

        processing_status, _ = OrderStatus.objects.get_or_create(
            status_code='processing', defaults={'display_name': 'Processing'}
        )
        order.order_status = processing_status
        order.save(update_fields=['order_status'])

        # Clear cart for user if authenticated
        if order.customer and order.customer.user_id:
            Cart.objects.filter(user_id=order.customer.user_id).delete()

        redirect_url = f"{frontend_url}/payment/success?order_id={order.id}&tran_id={tran_id or ''}"
        return HttpResponseRedirect(redirect_url)
    else:
        logger.error(f"SSLCommerz validation failed for order #{order.id}, val_id: {val_id}")
        redirect_url = f"{frontend_url}/payment/failed?order_id={order.id}&reason=validation_failed"
        return HttpResponseRedirect(redirect_url)


@csrf_exempt
def sslcommerz_fail_view(request):
    """
    Handles callback from SSLCommerz when payment fails.
    Accepts both POST (SSLCommerz server callback) and GET (browser redirect fallback).
    """
    data = _get_ssl_params(request)
    tran_id = data.get('tran_id')
    value_a = data.get('value_a')
    frontend_url = settings.FRONTEND_URL.rstrip('/')

    order = None
    if tran_id:
        order = Order.objects.filter(payment_info__transaction_id=tran_id).first()
    if not order and value_a and value_a.isdigit():
        order = Order.objects.filter(id=int(value_a)).first()

    order_param = f"order_id={order.id}&" if order else ""
    return HttpResponseRedirect(f"{frontend_url}/payment/failed?{order_param}reason=payment_failed&tran_id={tran_id or ''}")


@csrf_exempt
def sslcommerz_cancel_view(request):
    """
    Handles callback from SSLCommerz when customer cancels payment.
    Accepts both POST (SSLCommerz server callback) and GET (browser redirect fallback).
    """
    data = _get_ssl_params(request)
    tran_id = data.get('tran_id')
    value_a = data.get('value_a')
    frontend_url = settings.FRONTEND_URL.rstrip('/')

    order = None
    if tran_id:
        order = Order.objects.filter(payment_info__transaction_id=tran_id).first()
    if not order and value_a and value_a.isdigit():
        order = Order.objects.filter(id=int(value_a)).first()

    order_param = f"order_id={order.id}&" if order else ""
    return HttpResponseRedirect(f"{frontend_url}/payment/cancelled?{order_param}tran_id={tran_id or ''}")


@csrf_exempt
def sslcommerz_ipn_view(request):
    """
    Handles background server-to-server Instant Payment Notification (IPN) webhook from SSLCommerz.
    """
    val_id = request.POST.get('val_id')
    tran_id = request.POST.get('tran_id')
    card_type = request.POST.get('card_type')
    bank_tran_id = request.POST.get('bank_tran_id')
    value_a = request.POST.get('value_a')

    order = None
    if tran_id:
        order = Order.objects.filter(payment_info__transaction_id=tran_id).first()
    if not order and value_a and value_a.isdigit():
        order = Order.objects.filter(id=int(value_a)).first()

    if not order or not val_id:
        return JsonResponse({"status": "FAILED", "reason": "Order or val_id missing"}, status=400)

    from .sslcommerz import SSLCommerzClient
    client = SSLCommerzClient()
    validated_data = client.validate_payment(val_id)

    if validated_data:
        if order.payment_info and not order.payment_info.is_paid:
            order.payment_info.is_paid = True
            order.payment_info.payment_method = 'sslcommerz'
            order.payment_info.transaction_id = bank_tran_id or tran_id
            order.payment_info.paid_from = card_type or validated_data.get('card_type', 'SSLCommerz')
            order.payment_info.payment_date = timezone.now()
            order.payment_info.save()

            processing_status, _ = OrderStatus.objects.get_or_create(
                status_code='processing', defaults={'display_name': 'Processing'}
            )
            order.order_status = processing_status
            order.save(update_fields=['order_status'])

        return JsonResponse({"status": "SUCCESS", "message": "IPN validated and order updated."})

    return JsonResponse({"status": "FAILED", "reason": "Validation rejected"}, status=400)
