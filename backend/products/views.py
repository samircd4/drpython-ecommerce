from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import (
    AllowAny,
    IsAdminUser
)
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter, NumberFilter
from django.shortcuts import get_object_or_404
from django.db.models import Q, Min, Max, Sum
from django.db.models.functions import Coalesce
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from api.permissions import StaffHasActionPermission

from .models import (
    Product, Category, Brand
)
from .serializers import (
    ProductSerializer, CategorySerializer, BrandSerializer
)

class ProductFilter(FilterSet):
    category__name__in = CharFilter(method='filter_category_name_in')
    brand__name__in = CharFilter(method='filter_brand_name_in')
    price__gte = NumberFilter(field_name='price', lookup_expr='gte')
    price__lte = NumberFilter(field_name='price', lookup_expr='lte')
    rating__gte = NumberFilter(field_name='rating', lookup_expr='gte')

    class Meta:
        model = Product
        fields = {
            'category': ['exact'],
            'category__name': ['exact'],
            'category__slug': ['exact'],
            'brand': ['exact'],
            'brand__name': ['exact'],
            'brand__slug': ['exact'],
            'is_featured': ['exact'],
            'is_bestseller': ['exact'],
            'is_active': ['exact'],
            'rating': ['exact', 'gte'],
            'price': ['exact', 'gte', 'lte'],
        }

    def filter_category_name_in(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(category__name__in=value.split(','))

    def filter_brand_name_in(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(brand__name__in=value.split(','))

@extend_schema(tags=['Catalog'])
class ProductViewSet(viewsets.ModelViewSet):
    queryset = (
        Product.objects.all()
        .select_related('brand', 'category')
        .prefetch_related(
            'gallery_images',
            'specifications',
            'variants',
            'related_products',
            'reviews__customer'
        )
        .annotate(
            sold_count=Coalesce(Sum('order_items__quantity'), 0)
        )
    )

    serializer_class = ProductSerializer
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter

    search_fields = [
        'name',
        'description',
        'sku',
        'product_id',
        'brand__name',
        'category__name'
    ]

    # ✅ Default ordering: Last added product first
    ordering = ['-created_at']
    ordering_fields = ['created_at', 'rating', 'sold_count']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser(), StaffHasActionPermission()]
        return [AllowAny()]

    # ----------------------------
    # 🔍 AUTOCOMPLETE SUGGESTIONS
    # ----------------------------
    @extend_schema(
        summary="Suggest Products",
        description="Autocomplete suggestions for search bar.",
        parameters=[
            OpenApiParameter("search", OpenApiTypes.STR)
        ],
    )
    @action(detail=False, methods=['get'])
    def suggest(self, request):
        query = request.query_params.get('search', '')
        if not query:
            return Response([])

        products = self.get_queryset().filter(
            Q(name__icontains=query) | Q(sku__icontains=query)
        )[:10]

        return Response([
            {'id': p.id, 'name': p.name, 'slug': p.slug}
            for p in products
        ])

    # ----------------------------
    # 🔍 FULL SEARCH
    # ----------------------------
    @extend_schema(summary="Search Products")
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response([])

        results = self.get_queryset().filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(sku__icontains=query) |
            Q(brand__name__icontains=query) |
            Q(category__name__icontains=query)
        ).distinct()

        page = self.paginate_queryset(results)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    # ----------------------------
    # ⭐ FEATURED
    # ----------------------------
    @extend_schema(summary="Featured Products")
    @action(detail=False, methods=['get'])
    def featured(self, request):
        qs = self.filter_queryset(
            self.get_queryset().filter(is_featured=True)
        )
        page = self.paginate_queryset(qs)
        if page:
            return self.get_paginated_response(
                self.get_serializer(page, many=True).data
            )
        return Response(self.get_serializer(qs, many=True).data)

    # ----------------------------
    # 💰 PRICE RANGE
    # ----------------------------
    @extend_schema(summary="Get Min/Max Price")
    @action(detail=False, methods=['get'])
    def price_range(self, request):
        from django.db.models import Min, Max
        prices = self.get_queryset().aggregate(min_p=Min('price'), max_p=Max('price'))
        return Response({
            'min': float(prices['min_p'] or 0),
            'max': float(prices['max_p'] or 0)
        })

    # ----------------------------
    # 🔥 BESTSELLERS
    # ----------------------------
    @extend_schema(summary="Bestselling Products")
    @action(detail=False, methods=['get'])
    def bestsellers(self, request):
        qs = self.get_queryset().filter(is_bestseller=True)
        page = self.paginate_queryset(qs)
        if page:
            return self.get_paginated_response(
                self.get_serializer(page, many=True).data
            )
        return Response(self.get_serializer(qs, many=True).data)

    # ----------------------------
    # 🔗 RELATED PRODUCTS
    # ----------------------------
    @extend_schema(summary="Related Products")
    @action(detail=True, methods=['get'])
    def related(self, request, pk=None):
        product = self.get_object()

        related = product.related_products.all()

        if related.count() < 4:
            same_category = (
                Product.objects
                .filter(category=product.category)
                .exclude(id=product.id)
                .exclude(id__in=related.values_list('id', flat=True))
                .order_by('?')[:4]
            )
            related = (related | same_category).distinct()

        return Response(
            self.get_serializer(related, many=True).data
        )

    # ----------------------------
    # 🔐 SLUG OR ID LOOKUP
    # ----------------------------
    def get_object(self):
        lookup_value = self.kwargs.get(self.lookup_url_kwarg)

        if lookup_value.isdigit():
            return get_object_or_404(self.get_queryset(), pk=lookup_value)

        return get_object_or_404(self.get_queryset(), slug=lookup_value)


@extend_schema(tags=['Catalog'])
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('-id')
    serializer_class = CategorySerializer
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['name']
    filterset_fields = ['parent']  # Allows filtering by parent=null for roots

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser(), StaffHasActionPermission()]
        return [AllowAny()]

    @extend_schema(
        summary="Root Categories",
        description="Return only top-level categories."
    )
    @action(detail=False, methods=['get'])
    def roots(self, request):
        """Return only top-level categories"""
        roots = self.queryset.filter(parent__isnull=True)
        serializer = self.get_serializer(roots, many=True)
        return Response(serializer.data)


@extend_schema(tags=['Catalog'])
class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all().order_by('-id')
    serializer_class = BrandSerializer
    filter_backends = [SearchFilter]
    search_fields = ['name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser(), StaffHasActionPermission()]
        return [AllowAny()]

