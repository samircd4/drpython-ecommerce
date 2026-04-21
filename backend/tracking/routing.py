"""
WebSocket URL patterns for visitor tracking.

This routing module exposes the visitor tracking consumer
at the "ws/live-insights/" endpoint.
"""

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/live-insights/$', consumers.VisitorConsumer.as_asgi()),
]
