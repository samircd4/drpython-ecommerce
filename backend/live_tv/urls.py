from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ChannelViewSet, CountryViewSet, YouTubeStreamResolverView, BioscopePremiumStreamView, BioscopeSegmentRelayView

router = DefaultRouter()
router.register(r"countries", CountryViewSet, basename="country")
router.register(r"channels", ChannelViewSet, basename="channel")

urlpatterns = [
    # Explicit standalone endpoint for dynamic stream resolution
    path("youtube-resolve",YouTubeStreamResolverView.as_view(),name="youtube-stream-resolve",),
    # 1. Main .m3u8 index file provider & rewriter view
    path('bioscope-stream/', BioscopePremiumStreamView.as_view(), name='bioscope-stream'),
    
    # 2. Binary .ts segment router
    path('bioscope-segment/', BioscopeSegmentRelayView.as_view(), name='bioscope-segment'),
    # Automated router paths for viewsets
    path("", include(router.urls)),
]