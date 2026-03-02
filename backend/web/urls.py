from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContactMessageViewSet, NewsletterSubscriptionViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'contact', ContactMessageViewSet, basename='contact')
router.register(r'subscribe', NewsletterSubscriptionViewSet, basename='subscribe')
router.register(r'notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('', include(router.urls)),
]
