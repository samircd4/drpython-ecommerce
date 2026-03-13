from django.contrib import admin
from .models import Review, Question

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'customer', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('product__name', 'customer__name', 'comment')

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('product', 'customer', 'question', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('product__name', 'customer__name', 'question', 'answer')
