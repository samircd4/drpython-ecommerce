"""
ASGI config for ecommerce_api project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

from django.core.asgi import get_asgi_application

# Initialize Django ASGI application early
django_asgi_app = get_asgi_application()

from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.generic.websocket import AsyncWebsocketConsumer
import products.routing
import orders.routing
import notifications.routing
import chat.routing
from chat.middleware import TokenAuthMiddleware


class DebugConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("DEBUG: Connection received in DebugConsumer!")
        await self.accept()
        await self.send(text_data="Connection Successful!")

    async def disconnect(self, close_code):
        print(f"DEBUG: Disconnected in DebugConsumer with code {close_code}")


application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": TokenAuthMiddleware(
        URLRouter(
            notifications.routing.websocket_urlpatterns +
            orders.routing.websocket_urlpatterns +
            products.routing.websocket_urlpatterns +
            chat.routing.websocket_urlpatterns
        )
    ),
})

