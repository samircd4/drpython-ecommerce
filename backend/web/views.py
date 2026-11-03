from rest_framework import viewsets, mixins, status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission, SAFE_METHODS
from rest_framework.decorators import action
from rest_framework import serializers
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, inline_serializer
from .models import ContactMessage, NewsletterSubscription, Notification, StoreConfiguration
from .serializers import ContactMessageSerializer, NewsletterSubscriptionSerializer, NotificationSerializer, StoreConfigurationSerializer

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)

from api.permissions import StaffHasActionPermission

class StoreConfigurationView(generics.RetrieveUpdateAPIView):
    queryset = StoreConfiguration.objects.all()
    serializer_class = StoreConfigurationSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_object(self):
        return StoreConfiguration.load()


class ContactMessageViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]

class NewsletterSubscriptionViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = NewsletterSubscription.objects.all()
    serializer_class = NewsletterSubscriptionSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        # We handle existing emails by just returning success or a specific message
        email = request.data.get('email')
        if NewsletterSubscription.objects.filter(email=email).exists():
            return Response(
                {"detail": "You are already subscribed to our newsletter."},
                status=status.HTTP_200_OK
            )
        return super().create(request, *args, **kwargs)

class NotificationViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    """Notifications are always scoped to the requesting user, staff included."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = {'type': ['exact', 'in'], 'is_read': ['exact']}

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        # Paginated with ?page=; otherwise a plain array of the latest 50 (the storefront expects an array)
        if 'page' in request.query_params:
            return super().list(request, *args, **kwargs)
        queryset = self.filter_queryset(self.get_queryset())[:50]
        return Response(self.get_serializer(queryset, many=True).data)

    @extend_schema(responses={200: inline_serializer('UnreadCount', {'unread_count': serializers.IntegerField()})})
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        return Response({'unread_count': self.get_queryset().filter(is_read=False).count()})

    @extend_schema(request=None, responses={200: OpenApiTypes.OBJECT})
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save(update_fields=['is_read'])
        return Response({'status': 'ok'})

    @extend_schema(request=None, responses={200: OpenApiTypes.OBJECT})
    @action(detail=True, methods=['post'])
    def mark_unread(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = False
        notif.save(update_fields=['is_read'])
        return Response({'status': 'ok'})

    @extend_schema(request=None, responses={200: OpenApiTypes.OBJECT})
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'ok'})

    @extend_schema(request=None, responses={200: OpenApiTypes.OBJECT})
    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        self.get_queryset().delete()
        return Response({'status': 'ok'})
