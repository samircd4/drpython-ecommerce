from products.models import Product, Brand
from accounts.models import Customer
from reviews.models import Review

from products.serializers import ProductSerializer, BrandSerializer
from accounts.serializers import CustomerSerializer
from reviews.serializers import ReviewSerializer


EXPORT_REGISTRY = {
    "products": {
        "model": Product,
        "serializer": ProductSerializer,
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
}