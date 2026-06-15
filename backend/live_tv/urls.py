from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ChannelViewSet,
    CountryViewSet,
    YouTubeStreamProxyView,
    YouTubeStreamResolverView,
)

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
    # Proxy endpoint for rewriting HLS manifests and streaming segments
    path(
        "youtube-proxy",
        YouTubeStreamProxyView.as_view(),
        name="youtube-stream-proxy",
    ),
    # Automated router paths for viewsets
    path("", include(router.urls)),
]