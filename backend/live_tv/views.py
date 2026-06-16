import logging
import yt_dlp
import requests
import os
import re
from django.conf import settings
from django.http import HttpResponse, StreamingHttpResponse, JsonResponse
from rest_framework import viewsets, permissions
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

from .models import Channel, Country
from .serializers import ChannelSerializer, CountrySerializer

# Import the headless automation helper from your utils
from django.core.cache import cache
from .utils import fetch_bioscope_premium_headers


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



# Bioscope stream handling views will be added here in the future, following a similar pattern of proxying and rewriting as needed.
def get_cached_or_fresh_headers():
    """
    Retrieves premium metadata context from memory layer or invokes 
    headless background pipeline seamlessly if expired.
    """
    cached_headers = cache.get("bioscope_premium_headers")
    
    if not cached_headers:
        # Fallback to automated fetcher if memory array is empty
        fresh_headers = fetch_bioscope_premium_headers()
        if fresh_headers and "x-authorization" in fresh_headers:
            # Store credentials securely in cache matrix for 15 minutes
            cache.set("bioscope_premium_headers", fresh_headers, timeout=900)
            return fresh_headers
            
        # Hardcoded emergency backup (if network tracking stalls temporarily)
        return None
        
    return cached_headers

# ----------------------------------------------------------------------
# HARDCODED GLOBAL TOKENS MATRIX FOR TEMPORARY PRODUCTION BYPASS
# ----------------------------------------------------------------------
HARDCODED_PREMIUM_HEADERS = {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9,bn;q=0.8',
    'origin': 'https://www.bioscopeplus.com',
    'priority': 'u=1, i',
    'referer': 'https://www.bioscopeplus.com/',
    'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    
    # ⚠️ PLACE YOUR LIVE VALID COPIED BROWSER TOKENS HERE
    'x-authorization': 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjgyMDA1ODY0NzIwMzAyMDgiLCJhdWQiOlsiMSJdLCJleHAiOjE4MTI5OTc5MjQsIm5iZiI6MTc4MTQ2MTkyNCwiaWF0IjoxNzgxNDYxOTI0LCJqdGkiOiI1OTBkMmFlZjE5MzYyMWYxN2VkZTY4ZWU4MDY1NGQwYWI2OWFjMzljOGVmNjYwNjA1YmRjOWNhYmFkMjgzNmU5MzhiMmM1MjMxOWEzOGMwNSIsInNjb3BlcyI6WyJtYW5hZ2VfcHJvZmlsZXMiXSwicGlkIjoiMjM2MTkxOTQ4MjEyMjczMTUyIn0.Yxs-vsEp8RN5NTs4k5zyVm1Ls4QJ6cBi0ehxZijN6T3fKnecznMB2sFWknJOm5fo-EcMK71ly35mKNn0naiMwFX1_bH2T94f3c2HCT9EBeJsNJ2Z4xFjFZxAwVKhnnudgKlWeufJQsjXGT7y3xh6hZ3-W4OtxK_jWcgujBoq1P94oGnI6r7JhiNm1bHAybOo1SIKBmfI9xdgGLSO7vA3Wtp6q_E2Vh38mu9lcMZw_kM-36RkCicIEPhWOQ0XN9lfuwSL3Q0fFkPFFrd-kSAZzQEOdQF6tch4hx9OV08fZw9JquCEsUcGjWdnsuFxHg4iXP1-m-z53j1P4PiUwXN2CC8Fu7Rx7AJywJY7LM6w12qDkjdf2ZDrzPCI_q5HDWPseGam9eXmHObAuWa17AzBz4INASMKzpKTcOxeWwyoFueR8_t00l3VAIdwfgXbbnE9Vr0Szt9vTDYwXXWY3Op48hcjfO73X80OvGqVo9sinrRnTVkS79Z0PNDPV9YnaV0E_Kjue_-BN15say8_gev8WP1SxNoCUtO88VjJZyjnM8RKqxBAtVDancFJIijv4PXjdXy2npy70qYSrfkpk4UatJnO98LDoUi4h-TMCNybCoZAMTF6lrHeqkwQIDx9WIbiXY_d-cl9Nuo2rvJmvvMxCAeOHftjJX8wtbdCjM7qEFg',
    'vst': '20260615230326',
    'vpsid': '19a8459ebfb17195dac8',
    'vet': '20260615230326'
}

class BioscopePremiumStreamView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        base_stream_url = "https://fifa-stream-01.bioscopelive.com/out/v1/60e7608404004b1186261497b404630b/"
        manifest_name = "index_2.m3u8"
        full_url = f"{base_stream_url}{manifest_name}"
        
        # Swapping fallback function directly with global hardcoded dictionary packets
        premium_headers = HARDCODED_PREMIUM_HEADERS
        
        try:
            print(f"\n[MANIFEST-API] Forwarding token block handshake to: {full_url}")
            response = requests.get(full_url, headers=premium_headers, timeout=10)
            
            if response.status_code != 200:
                print(f"❌ Upstream Manifest failed with status: {response.status_code}")
                return JsonResponse({"error": "Failed fetching master manifest from upstream source"}, status=response.status_code)
                
            m3u8_content = response.text
            rewritten_lines = []
            
            for line in m3u8_content.splitlines():
                clean_line = line.strip()
                if not clean_line:
                    continue
                
                if "ivy.bioscopelive.com" in clean_line or (clean_line.startswith('http') and '.ts' in clean_line):
                    if 'URI="' in clean_line:
                        start_idx = clean_line.find('URI="') + 5
                        end_idx = clean_line.find('"', start_idx)
                        absolute_url = clean_line[start_idx:end_idx]
                        
                        proxied_url = f"/api/live-tv/bioscope-segment/?segment_url={absolute_url}"
                        modified_line = clean_line.replace(absolute_url, proxied_url)
                        rewritten_lines.append(modified_line)
                    else:
                        proxied_url = f"/api/live-tv/bioscope-segment/?segment_url={clean_line}"
                        rewritten_lines.append(proxied_url)
                
                elif '.ts' in clean_line and not clean_line.startswith('#'):
                    proxied_url = f"/api/live-tv/bioscope-segment/?segment_url={base_stream_url}{clean_line}"
                    rewritten_lines.append(proxied_url)
                
                else:
                    rewritten_lines.append(clean_line)
                    
            return HttpResponse("\n".join(rewritten_lines), content_type="application/x-mpegURL")
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


class BioscopeSegmentRelayView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        target_ts_url = request.GET.get("segment_url")
        if not target_ts_url:
            return HttpResponse(status=400)
            
        # Using the same hardcoded tracking block to feed authorization context parameters
        premium_headers = HARDCODED_PREMIUM_HEADERS
        
        try:
            # Proxy request to handle encrypted chunk segment load matrices
            proxied_res = requests.get(target_ts_url, headers=premium_headers, stream=True, timeout=15)
            
            return StreamingHttpResponse(
                proxied_res.iter_content(chunk_size=8192),
                status=proxied_res.status_code,
                content_type=proxied_res.headers.get('Content-Type', 'video/MP2T')
            )
        except Exception as err:
            print(f"❌ Segment Relay failed tracking context: {str(err)}")
            return HttpResponse(status=500)