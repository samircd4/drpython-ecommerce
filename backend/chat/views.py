from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

class ConversationListAPIView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        # Admin sees all conversations
        return Conversation.objects.all()

class MessageListAPIView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        queryset = Message.objects.filter(conversation_id=conversation_id)
        
        # Admin can see all, customers only their own
        if not self.request.user.is_staff:
            queryset = queryset.filter(conversation__customer=self.request.user)
            
        return queryset

class CustomerChatView(generics.GenericAPIView):
    """
    Get or create the conversation for the current logged in customer.
    """
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            # Try to get existing conversation
            conversation = Conversation.objects.filter(customer=self.request.user).first()
            if not conversation:
                conversation = Conversation.objects.create(customer=self.request.user)
            
            serializer = self.get_serializer(conversation)
            return Response(serializer.data)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
