import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Conversation, Message

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close()
            return

        # Users can join their specific conversation group
        # For customers, they usually have only one conversation
        # For admins, they might join multiple or stay in a general room to be added to specific ones
        
        # We'll expect a conversation ID if we're joining a specific chat
        # But for the initial setup, we can let them connect and then join groups based on messages
        
        await self.accept()

    async def disconnect(self, close_code):
        # Clean up any groups they were in
        if hasattr(self, 'groups_joined'):
            for group in self.groups_joined:
                await self.channel_layer.group_discard(group, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        chat_id = data.get('chatId')
        text = data.get('text')

        if action == 'join':
            # Verification: Only admin or the customer of this chat can join
            if await self.can_join_chat(chat_id):
                group_name = f'chat_{chat_id}'
                await self.channel_layer.group_add(group_name, self.channel_name)
                
                if not hasattr(self, 'groups_joined'):
                    self.groups_joined = set()
                self.groups_joined.add(group_name)
            return

        if chat_id and text:
            # Save message
            message = await self.save_message(chat_id, text, self.user)
            if not message:
                return

            conversation_group_name = f'chat_{chat_id}'
            
            # Broadcast to the group
            await self.channel_layer.group_send(
                conversation_group_name,
                {
                    'type': 'chat_message',
                    'message': {
                        'id': message.id,
                        'chatId': chat_id,
                        'text': message.text,
                        'sender': 'admin' if self.user.is_staff else 'user',
                        'senderEmail': self.user.email,
                        'time': message.timestamp.strftime('%I:%M %p')
                    }
                }
            )

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))

    @database_sync_to_async
    def can_join_chat(self, chat_id):
        try:
            conversation = Conversation.objects.get(id=chat_id)
            if self.user.is_staff or self.user.is_superuser:
                return True
            return conversation.customer == self.user
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, chat_id, text, user):
        try:
            conversation = Conversation.objects.get(id=chat_id)
            # Ensure user has permission to post to this chat
            if not user.is_staff and conversation.customer != user:
                return None
                
            message = Message.objects.create(
                conversation=conversation,
                sender=user,
                text=text
            )
            conversation.save() # Update updated_at
            return message
        except Conversation.DoesNotExist:
            return None
