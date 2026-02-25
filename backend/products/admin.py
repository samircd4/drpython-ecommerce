from django.contrib import admin
from .models import (
    Category, Brand, Product, ProductImage, ProductSpecification,
    ProductVariant
)

class ProductSpecificationInline(admin.TabularInline):
    model = ProductSpecification
    extra = 1

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0
    fields = ('sku', 'price', 'stock_quantity', 'ram', 'storage', 'color', 'is_active')
    readonly_fields = ('sku',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # 1. THE LIST VIEW (THE TABLE)
    # We put stock_quantity here so it's editable in the table
    list_display = (
        'name', 
        'stock_quantity', 
        'price', 
        'product_id', 
        'is_active', 
        'category', 
        'brand'
    )
    
    # These fields can be edited directly in the table
    # IMPORTANT: The field MUST be in list_display but NOT in list_display_links
    list_editable = ('stock_quantity', 'price', 'is_active')
    
    # These are the clickable links to open the product
    list_display_links = ('name', 'product_id')

    # 2. THE ADD/EDIT FORM
    # We move the stock field to the VERY TOP of the first section
    fieldsets = (
        ('STOCKS & PRICING (SIMPLE PRODUCTS)', {
            'fields': ('stock_quantity', 'price', 'wholesale_price', 'discount_price'),
            'description': 'Enter stock here ONLY if this product has NO variants.'
        }),
        ('MAIN INFO', {
            'fields': ('name', 'slug', 'product_id', 'sku', 'brand', 'category', 'related_products')
        }),
        ('SETTINGS', {
            'fields': ('is_active', 'is_featured', 'is_bestseller', 'image', 'short_description', 'description')
        }),
    )

    readonly_fields = ('product_id', 'slug', 'sku')
    search_fields = ('name', 'product_id', 'sku')
    list_filter = ('category', 'brand', 'is_active')
    
    inlines = [ProductSpecificationInline, ProductImageInline, ProductVariantInline]

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent')
    readonly_fields = ('slug',)

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    readonly_fields = ('slug',)
