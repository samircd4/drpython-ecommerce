from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from reviews.serializers import ReviewSerializer, QuestionSerializer

from .models import (
    Category, Brand, Product, ProductImage, ProductSpecification,
    ProductVariant
)


###########################################################################


# --- Helper Serializers ---
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary']


class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ['key', 'value']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'price', 'wholesale_price', 'discount_price',
            'stock_quantity', 'ram', 'storage', 'color', 'is_active'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        is_wholesaler = False
        if request and request.user and request.user.is_authenticated:
            if request.user.is_staff:
                is_wholesaler = True
            elif hasattr(request.user, 'customer') and request.user.customer.is_wholesaler:
                is_wholesaler = True
        
        if not is_wholesaler:
            data.pop('wholesale_price', None)
        return data


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo']


class SubCategorySerializer(serializers.ModelSerializer):
    """Used to avoid infinite recursion when serializing category children"""
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'logo']


class CategorySerializer(serializers.ModelSerializer):
    children = SubCategorySerializer(many=True, read_only=True)
    breadcrumbs = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'logo',
                  'parent', 'children', 'breadcrumbs']

    @extend_schema_field(serializers.ListField(child=serializers.DictField()))
    def get_breadcrumbs(self, obj):
        return obj.get_breadcrumbs()

# --- 0. HELPER SERIALIZERS (To avoid circular imports) ---


class SimpleProductSerializer(serializers.ModelSerializer):
    price = serializers.SerializerMethodField()
    wholesale_price = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'wholesale_price', 'image', 'slug', 'rating', 'reviews_count', 'product_type']

    def get_price(self, obj):
        return obj.display_price

    def get_wholesale_price(self, obj):
        return obj.display_wholesale_price

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            url = obj.image.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        is_wholesaler = False
        if request and request.user and request.user.is_authenticated:
            if request.user.is_staff:
                is_wholesaler = True
            elif hasattr(request.user, 'customer') and request.user.customer.is_wholesaler:
                is_wholesaler = True
        
        if not is_wholesaler:
            data.pop('wholesale_price', None)
        return data


# --- Main Product Serializer ---


class ProductSerializer(serializers.ModelSerializer):
    # ---------- READ ONLY DISPLAY ----------
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    gallery_images = serializers.SerializerMethodField()
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    related_products = SimpleProductSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)


    # ---------- WRITE ONLY INPUT ----------
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), source='brand', write_only=True
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    related_products_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Product.objects.all(),
        source='related_products',
        write_only=True,
        required=False
    )

    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    specs_input = serializers.JSONField(write_only=True, required=False)
    variants_input = serializers.JSONField(write_only=True, required=False)

    class Meta:
        model = Product
        fields = [
            'id', 'product_id', 'sku', 'name', 'slug',
            'description', 'short_description',

            'price', 'wholesale_price', 'discount_price',

            'brand', 'brand_id',
            'category', 'category_id',

            'image',
            'uploaded_images',
            'gallery_images',

            'specs_input',
            'specifications',

            'variants_input',
            'variants',

            'related_products_ids',
            'related_products',

            'rating', 'reviews_count', 'reviews', 'questions',
            'product_type', 'stock_quantity', 'is_featured', 'is_bestseller', 'is_active',
            'created_at', 'updated_at',
        ]

    @extend_schema_field(ProductImageSerializer(many=True))
    def get_gallery_images(self, obj):
        # Exclude the primary image from the gallery array as it's now in Product.image
        qs = obj.gallery_images.filter(is_primary=False)
        return ProductImageSerializer(qs, many=True, context=self.context).data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Override display values with smart logic from model properties
        data['price'] = instance.display_price
        data['discount_price'] = instance.display_discount_price
        
        # Wholesale visibility logic
        request = self.context.get('request')
        is_wholesaler = False
        if request and request.user and request.user.is_authenticated:
            if request.user.is_staff or (hasattr(request.user, 'customer') and request.user.customer.is_wholesaler):
                is_wholesaler = True
        
        if is_wholesaler:
            data['wholesale_price'] = instance.display_wholesale_price
        else:
            data.pop('wholesale_price', None)
            
        return data

    # ---------- UPDATE ----------
    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        specs_input = validated_data.pop('specs_input', None)
        variants_input = validated_data.pop('variants_input', None)
        related_products = validated_data.pop('related_products', [])

        # Update core fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Handle Images (Uploaded and Deleted)
        deleted_images_raw = self.context['request'].data.get('deleted_images')
        if deleted_images_raw:
            try:
                import json
                ids = json.loads(deleted_images_raw)
                ProductImage.objects.filter(id__in=ids, product=instance).delete()
            except Exception:
                pass

        uploaded_images = self.context['request'].FILES.getlist('uploaded_images')
        primary_image_id = self.context['request'].data.get('primary_image_id')
        primary_new_image_index = self.context['request'].data.get('primary_new_image_index')

        # Robust primary image handling
        if primary_image_id or primary_new_image_index is not None:
             # Clear ALL current primaries
             ProductImage.objects.filter(product=instance).update(is_primary=False)

             # Handle existing image primary status
             if primary_image_id:
                try:
                    target_img = ProductImage.objects.get(id=primary_image_id, product=instance)
                    target_img.is_primary = True
                    target_img.save() # This triggers the model sync to Product.image
                except Exception:
                    pass

        # Handle uploaded images
        for i, image_data in enumerate(uploaded_images):
            is_p = False
            if primary_new_image_index is not None and str(primary_new_image_index) == str(i):
                is_p = True
            
            pimg = ProductImage.objects.create(product=instance, image=image_data, is_primary=is_p)
            if is_p:
                instance.image = pimg.image
                instance.save(update_fields=['image'])

        # Update Related Products
        if related_products is not None:
            instance.related_products.set(related_products)

        # Update Gallery Images (already handled above via FILES)
        pass

        # Update Specifications (Replace existing for simplicity/cleanliness)
        if specs_input is not None:
            instance.specifications.all().delete()
            for spec in specs_input:
                ProductSpecification.objects.create(
                    product=instance,
                    key=spec.get('key'),
                    value=spec.get('value')
                )

        # Update Variants
        if variants_input is not None:
            instance.variants.all().delete()
            for variant_data in variants_input:
                # Clean data: Replace empty strings with None for nullable fields
                for field in ['wholesale_price', 'discount_price', 'ram', 'storage']:
                    if variant_data.get(field) == '':
                        variant_data[field] = None
                ProductVariant.objects.create(product=instance, **variant_data)

        return instance

    def create(self, validated_data):
        uploaded_images_data = self.context['request'].FILES.getlist('uploaded_images')
        primary_new_image_index = self.context['request'].data.get('primary_new_image_index')
        
        specs_input = validated_data.pop('specs_input', [])
        variants_input = validated_data.pop('variants_input', [])
        related_products = validated_data.pop('related_products', [])

        # Remove uploaded_images from validated_data as we handle it manually
        validated_data.pop('uploaded_images', None)

        product = Product.objects.create(**validated_data)

        if related_products:
            product.related_products.set(related_products)

        # Handle Images with Primary support
        for i, image in enumerate(uploaded_images_data):
            is_p = False
            if primary_new_image_index is not None and str(primary_new_image_index) == str(i):
                is_p = True
            pimg = ProductImage.objects.create(product=product, image=image, is_primary=is_p)
            if is_p:
                product.image = pimg.image
                product.save(update_fields=['image'])

        for spec in specs_input or []:
            ProductSpecification.objects.create(
                product=product,
                key=spec.get('key'),
                value=spec.get('value')
            )

        for variant_data in variants_input or []:
            # Clean data: Replace empty strings with None for nullable fields
            for field in ['wholesale_price', 'discount_price', 'ram', 'storage']:
                if variant_data.get(field) == '':
                    variant_data[field] = None
            ProductVariant.objects.create(product=product, **variant_data)

        return product
