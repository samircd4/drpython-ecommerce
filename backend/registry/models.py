from products.models import Product, Brand
from accounts.models import Customer

from products.serializers import ProductSerializer, BrandSerializer
from accounts.serializers import CustomerSerializer


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
}