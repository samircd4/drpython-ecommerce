from rest_framework import serializers
from .models import Review, Question, ReviewImage


class QuestionSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(
        source='customer.name', read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'product', 'customer_name',
                  'question', 'answer', 'created_at']
        read_only_fields = ['customer']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['customer'] = request.user.customer
        return super().create(validated_data)

class ReviewImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewImage
        fields = ['id', 'image', 'created_at']


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(
        source='customer.name', read_only=True)
    customer_avatar = serializers.SerializerMethodField()
    product_name = serializers.CharField(
        source='product.name', read_only=True)
    images = ReviewImageSerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product', 'product_name', 'rating',
                  'comment', 'image', 'images', 'customer_name', 'customer_avatar', 'created_at']
        read_only_fields = ['customer']

    def get_customer_avatar(self, obj):
        request = self.context.get('request')
        url = None
        if hasattr(obj, 'customer') and obj.customer:
            if obj.customer.avatar:
                url = obj.customer.avatar.url
            elif getattr(obj.customer, 'social_avatar_url', None):
                url = obj.customer.social_avatar_url

        if url:
            if request and not url.startswith('http'):
                return request.build_absolute_uri(url)
            return url
        return None

    def validate(self, data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            customer = request.user.customer
            product = data.get('product')
            # Only check for existing review if we are creating a new one (not updating)
            if self.instance is None and Review.objects.filter(product=product, customer=customer).exists():
                raise serializers.ValidationError(
                    "You have already reviewed this product.")
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        validated_data['customer'] = user.customer
        
        # Pop standard image if provided (for backward compatibility or main image)
        image = validated_data.pop('image', None)
        
        review = Review.objects.create(image=image, **validated_data)
        
        # Handle multiple images
        images_data = request.FILES.getlist('uploaded_images')
        for image_data in images_data:
            ReviewImage.objects.create(review=review, image=image_data)
            
        return review
