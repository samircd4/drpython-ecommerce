from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, CartViewSet, CheckoutViewSet, CartItemViewSet, PaymentViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'payments', PaymentViewSet, basename='payment-info')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart-items', CartItemViewSet, basename='cart-item')
router.register(r'checkout', CheckoutViewSet, basename='checkout')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
]
