from rest_framework import serializers
from .models import Conversation, Message
from django.contrib.auth import get_user_model


class UserShortSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = None  # assigned below after apps are ready
        fields = ['id', 'email', 'first_name', 'last_name', 'profile_picture']

    def get_profile_picture(self, obj):
        try:
            if hasattr(obj, 'customer'):
                if obj.customer.avatar:
                    return obj.customer.avatar.url
                if obj.customer.social_avatar_url:
                    return obj.customer.social_avatar_url
        except Exception:
            pass
        return None


# Assign model after class definition — apps are fully loaded by serializer import time
UserShortSerializer.Meta.model = get_user_model()


class MessageSerializer(serializers.ModelSerializer):
    sender = UserShortSerializer(read_only=True)
    parent_message_id = serializers.PrimaryKeyRelatedField(
        source='parent_message',
        read_only=True
    )
    reactions = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'guest_id', 'text', 'timestamp', 
            'is_read', 'reactions', 'parent_message_id', 'image', 'video'
        ]

    def get_reactions(self, obj):
        if not obj.reactions:
            return {}
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        enriched = {}
        
        for emoji, u_ids in obj.reactions.items():
            enriched[emoji] = []
            for uid in u_ids:
                try:
                    if isinstance(uid, int) or (isinstance(uid, str) and uid.isdigit()):
                        user = User.objects.get(id=uid)
                        avatar_url = None
                        try:
                            if hasattr(user, 'customer'):
                                if user.customer.avatar:
                                    avatar_url = user.customer.avatar.url
                                elif user.customer.social_avatar_url:
                                    avatar_url = user.customer.social_avatar_url
                        except Exception:
                            pass

                        enriched[emoji].append({
                            'id': str(user.id),
                            'name': f"{user.first_name} {user.last_name}".strip() or user.email,
                            'is_staff': user.is_staff,
                            'avatar': avatar_url
                        })
                    else:
                        enriched[emoji].append({
                            'id': str(uid),
                            'name': 'Guest',
                            'is_staff': False,
                            'avatar': None
                        })
                except Exception:
                    enriched[emoji].append({
                        'id': str(uid),
                        'name': 'User',
                        'is_staff': False,
                        'avatar': None
                    })
        return enriched


class ConversationSerializer(serializers.ModelSerializer):
    customer = UserShortSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'customer', 'created_at', 'updated_at', 'last_message', 'unread_count']

    def get_last_message(self, obj):
        try:
            last_message = obj.messages.order_by('-timestamp').first()
            if last_message:
                data = MessageSerializer(last_message).data
                return data
            return None
        except Exception as e:
            print(f"DEBUG: Error in get_last_message: {str(e)}")
            return None

    def get_unread_count(self, obj):
        try:
            request = self.context.get('request')
            if not request:
                return 0
                
            user = request.user
            queryset = obj.messages.filter(is_read=False)
            
            if user.is_authenticated:
                queryset = queryset.exclude(sender=user)
            else:
                guest_id = request.query_params.get('guest_id') or request.headers.get('X-Guest-ID')
                if guest_id:
                    # Use string comparison just in case
                    queryset = queryset.exclude(guest_id=guest_id)
                    
            count = queryset.count()
            return count
        except Exception as e:
            print(f"DEBUG: Error in get_unread_count: {str(e)}")
            import traceback
            traceback.print_exc()
            return 0
