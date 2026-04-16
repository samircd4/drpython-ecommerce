"""
ASGI config for ecommerce_api project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

# Initialize Django ASGI application early
django_asgi_app = get_asgi_application()

# Import Django-dependent modules after initialization
from chat.middleware import TokenAuthMiddleware
import tracking.routing
import chat.routing
import notifications.routing
import orders.routing
import products.routing


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
            tracking.routing.websocket_urlpatterns +
            notifications.routing.websocket_urlpatterns +
            orders.routing.websocket_urlpatterns +
            products.routing.websocket_urlpatterns +
            chat.routing.websocket_urlpatterns
        )
    ),
})
