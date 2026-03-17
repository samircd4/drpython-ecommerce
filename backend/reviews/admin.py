from django.contrib import admin
from .models import Review, Question, ReviewImage

class ReviewImageInline(admin.TabularInline):
    model = ReviewImage
    extra = 1

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'customer', 'rating', 'image', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('product__name', 'customer__name', 'comment')
    inlines = [ReviewImageInline]

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('product', 'customer', 'question', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('product__name', 'customer__name', 'question', 'answer')
