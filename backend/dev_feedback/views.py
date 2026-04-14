from django.utils import timezone
from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend

from .models import DevFeedback
from .serializers import DevFeedbackListSerializer, DevFeedbackDetailSerializer
from .filters import DevFeedbackFilter


class DevFeedbackViewSet(viewsets.ModelViewSet):
    """
    Public  : POST  /api/dev-feedback/           → submit feedback (AllowAny)
    Admin   : GET / GET{id} / PATCH{id} / DELETE → manage feedback (IsAuthenticated)
    """
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DevFeedbackFilter
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status']
    ordering = ['-created_at']

    # ── Queryset: exclude soft-deleted ──────────────────────────────────────
    def get_queryset(self):
        return DevFeedback.objects.filter(deleted_at__isnull=True).select_related(
            'assigned_to', 'created_by'
        )

    # ── Serializer selection ─────────────────────────────────────────────────
    def get_serializer_class(self):
        if self.action in ('list', 'partial_update'):
            return DevFeedbackListSerializer
        return DevFeedbackDetailSerializer

    # ── Per-action permissions ───────────────────────────────────────────────
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    # ── Create: capture metadata, set created_by if authenticated ───────────
    def perform_create(self, serializer):
        request = self.request
        ip = self._get_client_ip(request)
        ua = request.META.get('HTTP_USER_AGENT', '')
        created_by = request.user if request.user.is_authenticated else None
        serializer.save(
            status=DevFeedback.Status.NEW,
            ip_address=ip,
            user_agent=ua,
            created_by=created_by,
        )

    # ── Soft delete ──────────────────────────────────────────────────────────
    def perform_destroy(self, instance):
        instance.deleted_at = timezone.now()
        instance.save(update_fields=['deleted_at'])

    # ── Helpers ─────────────────────────────────────────────────────────────
    @staticmethod
    def _get_client_ip(request):
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded:
            return x_forwarded.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
