from products.models import Product, Brand, Category
from accounts.models import Customer
from reviews.models import Review
from orders.models import Order, PaymentInfo, Coupon

from products.serializers import ProductSerializer, BrandSerializer, CategorySerializer
from accounts.serializers import CustomerSerializer
from reviews.serializers import ReviewSerializer
from orders.serializers import OrderSerializer, PaymentInfoSerializer, CouponSerializer


EXPORT_REGISTRY = {
    "products": {
        "model": Product,
        "serializer": ProductSerializer,
    },
    "categories": {
        "model": Category,
        "serializer": CategorySerializer,
    },
    "brands": {
        "model": Brand,
        "serializer": BrandSerializer,
    },
    "customers": {
        "model": Customer,
        "serializer": CustomerSerializer,
    },
    "reviews": {
        "model": Review,
        "serializer": ReviewSerializer,
    },
    "orders": {
        "model": Order,
        "serializer": OrderSerializer,
    },
    "payment_infos": {
        "model": PaymentInfo,
        "serializer": PaymentInfoSerializer,
    },
    "coupons": {
        "model": Coupon,
        "serializer": CouponSerializer,
    },
}