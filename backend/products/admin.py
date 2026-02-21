from django.contrib import admin
from .models import (
    Category, Brand, Product, ProductImage, ProductSpecification,
    ProductVariant
)

class ProductSpecificationInline(admin.TabularInline):
    model = ProductSpecification
    extra = 1
    autocomplete_fields = ['product']

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'alt_text', 'is_primary', 'order')

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0
    fields = ('sku', 'price', 'wholesale_price', 'discount_price',
              'stock_quantity', 'ram', 'storage', 'color', 'is_active')
    readonly_fields = ('sku',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'product_id',
        'stock_quantity',
        'display_price',
        'is_active',
        'is_featured',
        'brand',
        'category',
    )
    
    # This makes the fields editable directly in the table
    list_editable = ('stock_quantity', 'is_active', 'is_featured')
    
    # These become the clickable links to open the product
    list_display_links = ('name', 'product_id')

    list_filter = ('brand', 'category', 'is_active', 'is_featured', 'is_bestseller')
    search_fields = ('name', 'product_id', 'sku')
    filter_horizontal = ('related_products',)

    readonly_fields = ('product_id', 'slug', 'sku', 'created_at', 'updated_at')

    inlines = [
        ProductSpecificationInline,
        ProductImageInline,
        ProductVariantInline,
    ]

    fieldsets = (
        ('Product Inventory & Pricing', {
            'fields': ('stock_quantity', 'price', 'wholesale_price', 'discount_price'),
            'description': 'NOTE: For simple products, set stock here. For variants, use the section below.'
        }),
        ('Basic Information', {
            'fields': ('name', 'slug', 'product_id', 'sku', 'brand', 'category', 'related_products')
        }),
        ('Status & Flags', {
            'fields': ('is_active', 'is_featured', 'is_bestseller')
        }),
        ('Media & Content', {
            'fields': ('image', 'short_description', 'description')
        }),
        ('Social Proof', {
            'fields': ('rating', 'reviews_count')
        }),
        ('Time Info', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    @admin.display(description="Price")
    def display_price(self, obj):
        if obj.variants.exists():
            return "Variant Based"
        return obj.price

    @admin.display(description="Total Stock")
    def display_stock(self, obj):
        if obj.variants.exists():
            return sum(v.stock_quantity for v in obj.variants.all())
        return obj.stock_quantity
