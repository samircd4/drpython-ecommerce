from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ChannelViewSet, CountryViewSet, YouTubeStreamResolverView

router = DefaultRouter()
router.register(r"countries", CountryViewSet, basename="country")
router.register(r"channels", ChannelViewSet, basename="channel")

urlpatterns = [
    # Explicit standalone endpoint for dynamic stream resolution
    path(
        "youtube-resolve",
        YouTubeStreamResolverView.as_view(),
        name="youtube-stream-resolve",
    ),
    # Automated router paths for viewsets
    path("", include(router.urls)),
]