from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OrderViewSet,
    CartViewSet,
    CheckoutViewSet,
    CartItemViewSet,
    PaymentViewSet,
    CouponViewSet,
    sslcommerz_success_view,
    sslcommerz_fail_view,
    sslcommerz_cancel_view,
    sslcommerz_ipn_view,
)

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'payments', PaymentViewSet, basename='payment-info')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart-items', CartItemViewSet, basename='cart-item')
router.register(r'checkout', CheckoutViewSet, basename='checkout')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'coupons', CouponViewSet, basename='coupon')

urlpatterns = [
    # SSLCommerz Payment Callbacks
    path('payment/sslcommerz/success/', sslcommerz_success_view, name='sslcommerz-success'),
    path('payment/sslcommerz/fail/', sslcommerz_fail_view, name='sslcommerz-fail'),
    path('payment/sslcommerz/cancel/', sslcommerz_cancel_view, name='sslcommerz-cancel'),
    path('payment/sslcommerz/ipn/', sslcommerz_ipn_view, name='sslcommerz-ipn'),

    path('', include(router.urls)),
]

