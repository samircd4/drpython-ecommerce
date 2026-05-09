from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg

from products.models import Product
from accounts.models import Customer


class Review(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name='product_reviews')

    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='reviews/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'customer')

    def save(self, *args, **kwargs):
        if self.image:
            try:
                from django.core.files.uploadedfile import UploadedFile
                from utils.images import process_image_to_webp
                if isinstance(self.image, UploadedFile):
                    optimized = process_image_to_webp(
                        self.image, 
                        name_source=f"review-{self.product.slug}-{self.customer.id}"
                    )
                    if optimized:
                        self.image = optimized
            except Exception as e:
                print(f"Error optimizing Review image: {e}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.rating}★ - {self.customer.name}"


class ReviewImage(models.Model):
    review = models.ForeignKey(
        Review, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='reviews/attachments/')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.image:
            try:
                from django.core.files.uploadedfile import UploadedFile
                from utils.images import process_image_to_webp
                if isinstance(self.image, UploadedFile):
                    optimized = process_image_to_webp(
                        self.image, 
                        name_source=f"review-img-{self.review.id}-{self.id or 'new'}"
                    )
                    if optimized:
                        self.image = optimized
            except Exception as e:
                print(f"Error optimizing ReviewImage: {e}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Image for {self.review}"


class Question(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name='questions')
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name='questions')
    question = models.TextField()
    answer = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Q: {self.question[:30]}... ({self.customer.name})"


@receiver([post_save, post_delete], sender=Review)
def update_product_rating(sender, instance, **kwargs):
    product = instance.product
    aggregate_data = Review.objects.filter(product=product).aggregate(
        avg_rating=Avg('rating'),
        count=models.Count('id')
    )
    product.rating = aggregate_data['avg_rating'] or 0.0
    product.reviews_count = aggregate_data['count'] or 0
    product.save()


@receiver([post_save, post_delete], sender=Question)
def update_product_questions_count(sender, instance, **kwargs):
    product = instance.product
    count = Question.objects.filter(product=product).count()
    product.questions_count = count
    product.save()
