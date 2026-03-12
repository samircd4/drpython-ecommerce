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
                
                # Request presence from others in the room
                await self.channel_layer.group_send(
                    group_name,
                    {
                        'type': 'presence_request',
                        'requestor_id': self.user.id
                    }
                )
                
                # Also announce self as online to this specific group immediately
                await self.channel_layer.group_send(
                    group_name,
                    {
                        'type': 'user_status',
                        'user_id': self.user.id,
                        'is_online': True
                    }
                )
                return

        # Get message type
        message_type = data.get('type', 'chat_message')

        if message_type == 'chat_message':
            text = data.get('text')
            parent_message_id = data.get('parent_message_id')

            if chat_id and (text or data.get('image') or data.get('video')):
                # Auto-join if not joined (reliability fix)
                group_name = f'chat_{chat_id}'
                if group_name not in self.groups_joined:
                    if await self.can_join_chat(chat_id):
                        await self.channel_layer.group_add(group_name, self.channel_name)
                        self.groups_joined.add(group_name)

                # Save message
                message = await self.save_message(chat_id, text, self.user, data, parent_message_id)
                if not message:
                    return

                # Prepare message data for broadcast
                broadcast_data = {
                    'id': message.id,
                    'chatId': chat_id,
                    'text': message.text,
                    'message_type': message.message_type,
                    'image': message.image.url if message.image else None,
                    'video': message.video.url if message.video else None,
                    'sender': {
                        'id': self.user.id,
                        'email': self.user.email,
                        'first_name': self.user.first_name,
                        'last_name': self.user.last_name,
                        'profile_picture': self.user.profile_picture.url if hasattr(self.user, 'profile_picture') and self.user.profile_picture else None,
                        'role': 'admin' if self.user.is_staff else 'user'
                    },
                    'sender_id': self.user.id,
                    'parent_message_id': message.parent_message_id,
                    'reactions': await self.get_message_reactions(message.id),
                    'time': localtime(message.timestamp).strftime('%I:%M %p')
                }

                # Broadcast to the group
                await self.channel_layer.group_send(
                    group_name,
                    {
                        'type': 'chat_message',
                        'message': broadcast_data
                    }
                )
        elif message_type == 'reaction':
            message_id = data.get('message_id')
            emoji = data.get('emoji')
            group_name = f'chat_{chat_id}'

            if message_id and emoji and chat_id:
                reactions = await self.update_reactions(message_id, self.user.id, emoji)
                
                await self.channel_layer.group_send(
                    group_name,
                    {
                        'type': 'reaction_update',
                        'message_id': message_id,
                        'reactions': reactions,
                        'chatId': chat_id
                    }
                )
            
        elif message_type == 'typing': # Original typing logic, now under 'type' check
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

    async def presence_request(self, event):
        """Respond to a presence request from a new joiner"""
        if event['requestor_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'user_status',
                'user_id': self.user.id,
                'is_online': True
            }))

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
    def update_reactions(self, message_id, user_id, emoji):
        try:
            msg = Message.objects.get(id=message_id)
            if not msg.reactions:
                msg.reactions = {}
            
            user_id_str = str(user_id)

            # Requirement: One reaction per user (replace previous)
            # 1. Remove user from ANY existing emoji lists
            for e in list(msg.reactions.keys()):
                if user_id_str in msg.reactions[e]:
                    msg.reactions[e].remove(user_id_str)
                    if not msg.reactions[e]:
                        del msg.reactions[e]
            
            # 2. Add the new reaction (unless they are "untoggling" the same emoji - though user request implies replacement)
            # If we want simple toggle (click same emoji to remove):
            # We already removed it above. If the new emoji is different, add it.
            # If the user clicked the SAME emoji, they now have NO reaction (standard toggle).
            
            if emoji not in msg.reactions:
                msg.reactions[emoji] = []
            
            msg.reactions[emoji].append(user_id_str)
            
            msg.save()
            return msg.reactions
        except Message.DoesNotExist:
            return {}

    async def reaction_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'reaction_update',
            'message_id': event['message_id'],
            'reactions': event['reactions'],
            'chatId': event['chatId'] # Include chat_id for client-side filtering
        }))

    @database_sync_to_async
    def get_message_reactions(self, message_id):
        try:
            msg = Message.objects.get(id=message_id)
            return msg.reactions or {}
        except Message.DoesNotExist:
            return {}

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
    def save_message(self, chat_id, text, user, data=None, parent_message_id=None):
        try:
            conversation = Conversation.objects.get(id=chat_id)
            if not user.is_staff and conversation.customer != user:
                return None
            
            msg_type = 'text'
            image_val = None
            video_val = None
            
            if data:
                if data.get('image'):
                    msg_type = 'image'
                    img_url = data.get('image')
                    image_val = img_url.replace('/media/', '') if img_url.startswith('/media/') else img_url
                elif data.get('video'):
                    msg_type = 'video'
                    vid_url = data.get('video')
                    video_val = vid_url.replace('/media/', '') if vid_url.startswith('/media/') else vid_url

            # Filter out empty text unless it's a media message
            if not text and not image_val and not video_val:
                return None

            message = Message.objects.create(
                conversation=conversation,
                sender=user,
                text=text or "",
                message_type=msg_type,
                parent_message_id=parent_message_id,
                image=image_val,
                video=video_val
            )
            
            conversation.save() # Update updated_at
            return message
        except Conversation.DoesNotExist:
            return None
