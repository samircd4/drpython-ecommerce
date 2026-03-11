from django.urls import path
from .views import (
    ConversationListAPIView, 
    MessageListAPIView, 
    CustomerChatView, 
    MarkAsReadAPIView
)

urlpatterns = [
    path('read/<int:pk>/', MarkAsReadAPIView.as_view(), name='mark-as-read'),
    path('init/', CustomerChatView.as_view(), name='customer-chat-init'),
    path('<int:conversation_id>/messages/', MessageListAPIView.as_view(), name='message-list'),
    path('', ConversationListAPIView.as_view(), name='conversation-list'),
]
