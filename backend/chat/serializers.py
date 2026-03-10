from rest_framework import serializers
from .models import Conversation, Message
from django.contrib.auth import get_user_model


class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = None  # assigned below after apps are ready
        fields = ['id', 'email', 'first_name', 'last_name']


# Assign model after class definition — apps are fully loaded by serializer import time
UserShortSerializer.Meta.model = get_user_model()


class MessageSerializer(serializers.ModelSerializer):
    sender = UserShortSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'text', 'timestamp', 'is_read']


class ConversationSerializer(serializers.ModelSerializer):
    customer = UserShortSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'customer', 'created_at', 'updated_at', 'last_message', 'unread_count']

    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-timestamp').first()
        if last_message:
            return MessageSerializer(last_message).data
        return None

    def get_unread_count(self, obj):
        return obj.messages.filter(is_read=False).exclude(
            sender=self.context['request'].user
        ).count()
