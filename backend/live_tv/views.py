import logging
import yt_dlp
import requests
import os
import re
from django.conf import settings
from django.http import JsonResponse, HttpResponse
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
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        youtube_url = request.GET.get("url")
        segment_url = request.GET.get("seg_url")

        if not segment_url:
            query_string = request.META.get('QUERY_STRING', '')
            if 'seg_url=' in query_string:
                segment_url = query_string.split('seg_url=', 1)[1]

        production_proxy = os.getenv("YOUTUBE_RESOLVER_PROXY")
        proxy_dict = {"http": production_proxy, "https": production_proxy} if production_proxy else {}

        if segment_url:
            import urllib.parse
            segment_url = urllib.parse.unquote(segment_url)
            try:
                response = requests.get(segment_url, proxies=proxy_dict, stream=True, timeout=15)
                django_stream = HttpResponse(response.content, content_type=response.headers.get('Content-Type'))
                django_stream["Access-Control-Allow-Origin"] = "*"
                return django_stream
            except Exception as e:
                return JsonResponse({"error": str(e)}, status=500)

        if not youtube_url:
            return JsonResponse({"error": 'Missing required "url" parameter.'}, status=400)

        ydl_opts = {
            "format": "best",
            "noplaylist": True,
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
            "socket_timeout": 10,
        }

        possible_cookie_paths = [
            "/app/youtube_cookies.txt",
            os.path.join(settings.BASE_DIR, "youtube_cookies.txt"),
            "youtube_cookies.txt"
        ]
        for path in possible_cookie_paths:
            if os.path.exists(path):
                ydl_opts["cookiefile"] = path
                break

        if production_proxy:
            ydl_opts["proxy"] = production_proxy

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(youtube_url, download=False)
                stream_url = info.get("url")

            if not stream_url:
                return JsonResponse({"error": "Unable to parse live stream manifest."}, status=404)

            response = requests.get(stream_url, proxies=proxy_dict, timeout=15)
            playlist_content = response.text

            base_api_url = request.build_absolute_uri(request.path)
            
            import urllib.parse
            def replace_link(match):
                actual_google_url = match.group(0)
                encoded_url = urllib.parse.quote(actual_google_url)
                return f"{base_api_url}?seg_url={encoded_url}"

            modified_playlist = re.sub(r'https?://[^\s]+googlevideo\.com[^\s]+', replace_link, playlist_content)

            django_response = HttpResponse(modified_playlist, content_type="application/x-mpegURL")
            django_response["Access-Control-Allow-Origin"] = "*"
            django_response["Access-Control-Allow-Headers"] = "*"
            return django_response

        except Exception as e:
            return JsonResponse({"error": f"Stream extraction failed: {str(e)}"}, status=500)