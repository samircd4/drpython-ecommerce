from django.urls import path
from .views import ConversationListAPIView, MessageListAPIView, CustomerChatView

app_name = 'chat'

urlpatterns = [
    path('', ConversationListAPIView.as_view(), name='conversation-list'),
    path('init/', CustomerChatView.as_view(), name='customer-chat-init'),
    path('<int:conversation_id>/messages/', MessageListAPIView.as_view(), name='message-list'),
]
