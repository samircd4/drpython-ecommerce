from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/product/<int:product_id>/', consumers.ProductConsumer.as_asgi()),
]
