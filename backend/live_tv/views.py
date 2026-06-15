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
                    import urllib.parse
                    proxy_url = request.build_absolute_uri(
                        f"/api/live-tv/youtube-proxy?url={urllib.parse.quote_plus(stream_url)}"
                    )
                    return HttpResponseRedirect(proxy_url)

                return JsonResponse(
                    {"error": "Unable to parse live stream manifest source."},
                    status=404,
                )

        except Exception as e:
            return JsonResponse(
                {"error": f"Stream extraction failed: {str(e)}"}, status=500
            )


class YouTubeStreamProxyView(APIView):
    """Proxies and rewrites HLS manifest and segment streams to bypass

    client IP-binding checks enforced by YouTube.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        import urllib.parse
        import requests
        from django.http import StreamingHttpResponse, HttpResponse

        target_url = request.GET.get("url")
        if not target_url:
            return JsonResponse(
                {"error": 'Missing required "url" parameter.'}, status=400
            )

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }

        # 1. Apply YOUTUBE_RESOLVER_PROXY if present in production environment
        proxies = {}
        production_proxy = os.getenv("YOUTUBE_RESOLVER_PROXY")
        if production_proxy:
            proxies = {
                "http": production_proxy,
                "https": production_proxy,
            }

        try:
            # Fetch content from target URL (stream=True for segment streaming)
            response = requests.get(
                target_url,
                headers=headers,
                proxies=proxies,
                stream=True,
                timeout=15,
            )

            content_type = response.headers.get("Content-Type", "")
            is_m3u8 = (
                "mpegurl" in content_type
                or "application/x-mpegurl" in content_type
                or target_url.split("?")[0].endswith(".m3u8")
            )

            # Case A: Handle HLS playlist manifest (.m3u8) by parsing and rewriting URLs
            if is_m3u8:
                content = response.text
                lines = content.splitlines()
                rewritten_lines = []
                base_url = target_url.rsplit("/", 1)[0] + "/"

                for line in lines:
                    stripped_line = line.strip()
                    if stripped_line and not stripped_line.startswith("#"):
                        # Resolve relative paths and build full absolute URL
                        absolute_url = urllib.parse.urljoin(base_url, stripped_line)
                        proxy_url = request.build_absolute_uri(
                            f"/api/live-tv/youtube-proxy?url={urllib.parse.quote_plus(absolute_url)}"
                        )
                        rewritten_lines.append(proxy_url)
                    else:
                        rewritten_lines.append(line)

                rewritten_content = "\n".join(rewritten_lines)
                return HttpResponse(
                    rewritten_content,
                    content_type="application/vnd.apple.mpegurl",
                    status=response.status_code,
                )

            # Case B: Handle binary video segment files (.ts) by streaming them
            django_response = StreamingHttpResponse(
                response.iter_content(chunk_size=8192),
                content_type=content_type,
                status=response.status_code,
            )
            # Forward caching and content headers
            for header in ["Content-Length", "Accept-Ranges"]:
                if header in response.headers:
                    django_response[header] = response.headers[header]
            return django_response

        except Exception as e:
            return JsonResponse(
                {"error": f"Stream proxy failed: {str(e)}"}, status=500
            )