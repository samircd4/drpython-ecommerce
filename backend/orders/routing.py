from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/order/<int:order_id>/', consumers.OrderConsumer.as_asgi()),
]
