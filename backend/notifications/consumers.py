import json
from channels.generic.websocket import AsyncWebsocketConsumer


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f'notifications_{self.user_id}'
        print(f"DEBUG: NotificationConsumer connecting for user {self.user_id}")

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        print(f"DEBUG: NotificationConsumer accepted for user {self.user_id}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def send_notification(self, event):
        """Handler for notification messages sent to this group."""
        await self.send(text_data=json.dumps(event['notification']))
