"""
ASGI config for ecommerce_api project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.generic.websocket import AsyncWebsocketConsumer
import products.routing
import orders.routing
import notifications.routing


class DebugConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("DEBUG: Connection received in DebugConsumer!")
        await self.accept()
        await self.send(text_data="Connection Successful!")

    async def disconnect(self, close_code):
        print(f"DEBUG: Disconnected in DebugConsumer with code {close_code}")

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_api.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            notifications.routing.websocket_urlpatterns +
            orders.routing.websocket_urlpatterns +
            products.routing.websocket_urlpatterns +
            [path("ws/debug/", DebugConsumer.as_asgi())]
        )
    ),
})
