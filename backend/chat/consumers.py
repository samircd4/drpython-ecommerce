import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils.timezone import localtime
from .models import Conversation, Message

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close()
            return

        self.groups_joined = set()
        await self.accept()
        
        # Notify that user is online
        await self.broadcast_presence(True)

    async def disconnect(self, close_code):
        # Notify that user is offline
        await self.broadcast_presence(False)
        
        # Clean up any groups they were in
        for group in self.groups_joined:
            await self.channel_layer.group_discard(group, self.channel_name)

    async def broadcast_presence(self, is_online):
        """Notify relevant groups about user's online status"""
        # Get all conversations for this user
        conv_ids = await self.get_user_conversations()
        for chat_id in conv_ids:
            group_name = f'chat_{chat_id}'
            await self.channel_layer.group_send(
                group_name,
                {
                    'type': 'user_status',
                    'user_id': self.user.id,
                    'is_online': is_online
                }
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        chat_id = data.get('chatId')
        text = data.get('text')

        if action == 'join' and chat_id:
            if await self.can_join_chat(chat_id):
                group_name = f'chat_{chat_id}'
                await self.channel_layer.group_add(group_name, self.channel_name)
                self.groups_joined.add(group_name)
                
                # Send current status of participants in this chat
                # (Optional: can be expanded)
                return

        if chat_id and text:
            # Auto-join if not joined (reliability fix)
            group_name = f'chat_{chat_id}'
            if group_name not in self.groups_joined:
                if await self.can_join_chat(chat_id):
                    await self.channel_layer.group_add(group_name, self.channel_name)
                    self.groups_joined.add(group_name)

            # Save message
            message = await self.save_message(chat_id, text, self.user)
            if not message:
                return

            # Broadcast to the group
            await self.channel_layer.group_send(
                group_name,
                {
                    'type': 'chat_message',
                    'message': {
                        'id': message.id,
                        'chatId': chat_id,
                        'text': message.text,
                        'sender': {
                            'id': self.user.id,
                            'email': self.user.email,
                            'first_name': self.user.first_name,
                            'last_name': self.user.last_name,
                            'role': 'admin' if self.user.is_staff else 'user'
                        },
                        'sender_id': self.user.id,
                        'time': localtime(message.timestamp).strftime('%I:%M %p')
                    }
                }
            )
            
        elif data.get('type') == 'typing':
            # Handle typing indicator
            group_name = f'chat_{chat_id}'
            await self.channel_layer.group_send(
                group_name,
                {
                    'type': 'typing_status',
                    'chatId': chat_id,
                    'sender_id': self.user.id,
                    'isTyping': data.get('isTyping', False)
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    async def user_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user_id': event['user_id'],
            'is_online': event['is_online']
        }))

    async def typing_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'chatId': event['chatId'],
            'sender_id': event['sender_id'],
            'isTyping': event['isTyping']
        }))

    @database_sync_to_async
    def get_user_conversations(self):
        if self.user.is_staff:
            return list(Conversation.objects.values_list('id', flat=True))
        return list(Conversation.objects.filter(customer=self.user).values_list('id', flat=True))

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
            # Handle potential race condition by creating conversation if it doesn't exist (e.g. first message)
            # But usually we expect it to exist. Let's just return None for now as per current logic.
            return None
