import yt_dlp
from django.http import HttpResponseRedirect, JsonResponse
from rest_framework import viewsets, permissions
from rest_framework.views import APIView

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

    permission_classes = [permissions.AllowAny]  # Publicly accessible for playback

    def get(self, request, *args, **kwargs):
        youtube_url = request.GET.get("url")

        if not youtube_url:
            return JsonResponse(
                {"error": 'Missing required "url" parameter.'}, status=400
            )

        # High-performance options to fetch metadata only without downloading segments
        ydl_opts = {
            "format": "best",
            "noplaylist": True,
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(youtube_url, download=False)
                stream_url = info.get("url")

                if stream_url:
                    # Return an HTTP 302 Redirect. Frontend Hls.js handles this automatically.
                    return HttpResponseRedirect(stream_url)

                return JsonResponse(
                    {"error": "Unable to parse live stream manifest source."},
                    status=404,
                )

        except Exception as e:
            return JsonResponse(
                {"error": f"Stream extraction failed: {str(e)}"}, status=500
            )