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
import products.routing
import orders.routing
import notifications.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_api.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            products.routing.websocket_urlpatterns +
            orders.routing.websocket_urlpatterns +
            notifications.routing.websocket_urlpatterns
        )
    ),
})
