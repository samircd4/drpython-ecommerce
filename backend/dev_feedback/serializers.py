from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import DevFeedback

User = get_user_model()


class AssignedUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email']

    def get_full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name or obj.username


class DevFeedbackListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    assigned_to = AssignedUserSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assigned_to',
        write_only=True,
        required=False,
        allow_null=True,
    )
    created_by = AssignedUserSerializer(read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = DevFeedback
        fields = [
            'id', 'title', 'type', 'type_display',
            'priority', 'priority_display',
            'status', 'status_display',
            'assigned_to', 'assigned_to_id',
            'created_by',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DevFeedbackDetailSerializer(serializers.ModelSerializer):
    """Full serializer with all fields for create/detail/update."""
    assigned_to = AssignedUserSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assigned_to',
        write_only=True,
        required=False,
        allow_null=True,
    )
    created_by = AssignedUserSerializer(read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    screenshot_url = serializers.SerializerMethodField()

    class Meta:
        model = DevFeedback
        fields = [
            'id', 'title', 'type', 'type_display',
            'priority', 'priority_display',
            'message', 'page_url',
            'screenshot', 'screenshot_url',
            'status', 'status_display',
            'assigned_to', 'assigned_to_id',
            'created_by',
            'ip_address', 'user_agent',
            'created_at', 'updated_at', 'deleted_at',
        ]
        read_only_fields = [
            'id', 'ip_address', 'user_agent',
            'created_at', 'updated_at', 'deleted_at',
        ]
        extra_kwargs = {
            'screenshot': {'write_only': True},
        }

    def get_screenshot_url(self, obj):
        if not obj.screenshot:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.screenshot.url)
        return obj.screenshot.url

    def validate_type(self, value):
        valid = [c[0] for c in DevFeedback.FeedbackType.choices]
        if value not in valid:
            raise serializers.ValidationError(
                f"Invalid type. Must be one of: {', '.join(valid)}"
            )
        return value

    def validate_priority(self, value):
        valid = [c[0] for c in DevFeedback.Priority.choices]
        if value not in valid:
            raise serializers.ValidationError(
                f"Invalid priority. Must be one of: {', '.join(valid)}"
            )
        return value

    def validate_status(self, value):
        valid = [c[0] for c in DevFeedback.Status.choices]
        if value not in valid:
            raise serializers.ValidationError(
                f"Invalid status. Must be one of: {', '.join(valid)}"
            )
        return value
