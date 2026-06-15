import logging
import yt_dlp
import os
from django.conf import settings
from django.http import HttpResponseRedirect, JsonResponse
from rest_framework import viewsets, permissions
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

from .models import Channel, Country
from .serializers import ChannelSerializer, CountrySerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Admin users get full write access.
    Authenticated users get read-only access (GET, HEAD, OPTIONS).
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_staff


class CountryViewSet(viewsets.ModelViewSet):
    """
    Admin: full CRUD on countries.
    Authenticated users: read-only.
    """

    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [IsAdminOrReadOnly]


class ChannelViewSet(viewsets.ModelViewSet):
    """
    Admin: full CRUD on channels.
    Authenticated users: read-only, filterable by ?country_slug=<slug>.
    """

    serializer_class = ChannelSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        # Return only active channels
        queryset = Channel.objects.filter(is_active=True).select_related("country")

        # Filter by country slug if provided as a query param (e.g. /channels/?country_slug=bd)
        country_slug = self.request.query_params.get("country_slug", None)
        if country_slug is not None:
            queryset = queryset.filter(country__slug=country_slug)

        return queryset


class YouTubeStreamResolverView(APIView):
    """Dynamically extracts the real-time .m3u8 live stream link

    from a persistent YouTube channel/video URL and redirects the player.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        youtube_url = request.GET.get("url")

        if not youtube_url:
            return JsonResponse(
                {"error": 'Missing required "url" parameter.'}, status=400
            )

        ydl_opts = {
            "format": "best",
            "noplaylist": True,
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
            "http_headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
            },
            "extractor_args": {
                "youtube": {
                    "player_client": ["default", "-android_sdkless"]
                }
            }
        }

        # 1. Read proxy from environment variable (only present in production .env)
        production_proxy = os.getenv("YOUTUBE_RESOLVER_PROXY")
        if production_proxy:
            logger.info("YouTube resolver using proxy: %s", production_proxy)
            ydl_opts["proxy"] = production_proxy
        else:
            logger.warning("YOUTUBE_RESOLVER_PROXY environment variable is not set.")

        # 2. Check for cookie file path (only loaded in production)
        if not settings.DEBUG:
            cookie_path = os.path.join(settings.BASE_DIR, "youtube_cookies.txt")
            if os.path.exists(cookie_path):
                logger.info("YouTube resolver using cookiefile at: %s", cookie_path)
                ydl_opts["cookiefile"] = cookie_path
            else:
                logger.warning("youtube_cookies.txt not found at: %s", cookie_path)

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(youtube_url, download=False)
                stream_url = info.get("url")

                if stream_url:
                    return HttpResponseRedirect(stream_url)

                return JsonResponse(
                    {"error": "Unable to parse live stream manifest source."},
                    status=404,
                )

        except Exception as e:
            return JsonResponse(
                {"error": f"Stream extraction failed: {str(e)}"}, status=500
            )