from django.contrib import admin
from .models import DevFeedback


@admin.register(DevFeedback)
class DevFeedbackAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'title', 'type', 'priority', 'status',
        'assigned_to', 'created_by', 'created_at',
    ]
    list_filter = ['type', 'priority', 'status']
    search_fields = ['title', 'message']
    readonly_fields = ['ip_address', 'user_agent', 'created_at', 'updated_at', 'deleted_at']
    ordering = ['-created_at']

    def get_queryset(self, request):
        return super().get_queryset(request).filter(deleted_at__isnull=True)
