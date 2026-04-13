from rest_framework import viewsets, mixins, status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission, SAFE_METHODS
from rest_framework.decorators import action
from .models import ContactMessage, NewsletterSubscription, Notification, StoreConfiguration
from .serializers import ContactMessageSerializer, NewsletterSubscriptionSerializer, NotificationSerializer, StoreConfigurationSerializer

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)

from api.permissions import StaffHasActionPermission

class StoreConfigurationView(generics.RetrieveUpdateAPIView):
    serializer_class = StoreConfigurationSerializer
    permission_classes = [IsAuthenticated, StaffHasActionPermission]

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
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        print(f"FETCHING NOTIFICATIONS FOR USER: {user} | IS_STAFF: {user.is_staff} | IS_SUPERUSER: {user.is_superuser}")
        return Notification.objects.all() # Temporarily show all to debug visibility issue

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()[:50]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({'status': 'ok'})

    @action(detail=True, methods=['post'])
    def mark_unread(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = False
        notif.save()
        return Response({'status': 'ok'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        if request.user.is_staff or request.user.is_superuser:
            Notification.objects.filter(is_read=False).update(is_read=True)
        else:
            Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'ok'})

    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        if request.user.is_staff or request.user.is_superuser:
            Notification.objects.all().delete()
        else:
            Notification.objects.filter(user=request.user).delete()
        return Response({'status': 'ok'})
