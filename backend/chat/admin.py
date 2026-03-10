from django.contrib import admin
from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['customer__email']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sender', 'text_preview', 'timestamp', 'is_read']
    list_filter = ['timestamp', 'is_read', 'conversation__customer']
    search_fields = ['text', 'conversation__customer__email']
    readonly_fields = ['timestamp']

    def text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_preview.short_description = 'Text Preview'
