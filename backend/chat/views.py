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
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        queryset = Message.objects.filter(conversation_id=conversation_id)
        
        # Admin can see all, customers only their own
        if self.request.user.is_authenticated:
            if not self.request.user.is_staff:
                queryset = queryset.filter(conversation__customer=self.request.user)
        else:
            # Guest filter
            guest_id = self.request.query_params.get('guest_id') or self.request.headers.get('X-Guest-ID')
            if guest_id:
                queryset = queryset.filter(conversation__guest_id=guest_id)
            else:
                queryset = queryset.none()
            
        return queryset

class CustomerChatView(generics.GenericAPIView):
    """
    Get or create the conversation for the current logged in customer or guest.
    """
    serializer_class = ConversationSerializer
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            print(f"DEBUG: CustomerChatView GET - user: {request.user}, auth: {request.user.is_authenticated}")
            if request.user.is_authenticated:
                # Try to get existing conversation for authenticated user
                conversation = Conversation.objects.filter(customer=self.request.user).first()
                if not conversation:
                    conversation = Conversation.objects.create(customer=self.request.user)
            else:
                # Guest identification
                guest_id = request.query_params.get('guest_id') or request.headers.get('X-Guest-ID')
                print(f"DEBUG: CustomerChatView guest_id: {guest_id}")
                if not guest_id:
                    print("DEBUG: CustomerChatView - missing guest_id")
                    return Response({"detail": "Guest identification required"}, status=status.HTTP_400_BAD_REQUEST)
                
                conversation = Conversation.objects.filter(guest_id=guest_id, customer__isnull=True).first()
                if not conversation:
                    print(f"DEBUG: CustomerChatView - creating new conversation for guest {guest_id}")
                    conversation = Conversation.objects.create(guest_id=guest_id)
                else:
                    print(f"DEBUG: CustomerChatView - found existing conversation {conversation.id} for guest {guest_id}")
            
            serializer = self.get_serializer(conversation)
            return Response(serializer.data)
        except Exception as e:
            import traceback
            print(f"ERROR: CustomerChatView exception: {str(e)}")
            traceback.print_exc()
            return Response({"detail": str(e), "traceback": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from rest_framework.views import APIView

class MarkAsReadAPIView(APIView):
    """
    Mark all unread messages in a conversation as read.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk, *args, **kwargs):
        try:
            conversation = Conversation.objects.get(pk=pk)
            
            # Security: Allow staff, the customer who owns the chat, or the guest who owns the chat
            if request.user.is_authenticated:
                if not request.user.is_staff and conversation.customer != request.user:
                    return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
            else:
                guest_id = request.query_params.get('guest_id') or request.headers.get('X-Guest-ID')
                if not guest_id or str(conversation.guest_id) != str(guest_id):
                    return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

            # Update messages sent by OTHERS
            messages_to_update = Message.objects.filter(
                conversation=conversation, 
                is_read=False
            )
            
            if request.user.is_authenticated:
                messages_to_update = messages_to_update.exclude(sender=request.user)
            else:
                messages_to_update = messages_to_update.exclude(guest_id=guest_id, sender__isnull=True)
            
            messages_to_update.update(is_read=True)

            return Response({"status": "Marked as read", "conversation_id": pk}, status=status.HTTP_200_OK)
        except Conversation.DoesNotExist:
            return Response({"detail": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)
from rest_framework.parsers import MultiPartParser, FormParser

class ChatMessageUploadView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file_obj = request.data.get('file')
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Simple file saving for local/prod
        # In production, this would go to S3 or a persistent volume
        from django.core.files.storage import default_storage
        filename = default_storage.save(f'chat_uploads/{file_obj.name}', file_obj)
        file_url = default_storage.url(filename)
        
        return Response({"url": file_url}, status=status.HTTP_201_CREATED)
