from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Customer, Address, Division, District, SubDistrict
from drf_spectacular.utils import extend_schema_field
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import uuid
from rest_framework.validators import UniqueValidator
from allauth.account.models import EmailAddress


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    full_name = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(
        write_only=True, required=False, allow_blank=True)
    email = serializers.EmailField(
        required=True,
    )

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    class Meta:
        model = User
        fields = ['id', 'username', 'email',
                  'password', 'full_name', 'phone_number']
        extra_kwargs = {
            'password': {
                'write_only': True,
                'style': {'input_type': 'password'}
            },
            'username': {
                'required': False,
            }
        }

    def create(self, validated_data):
        full_name = validated_data.pop('full_name')
        phone_number = validated_data.pop('phone_number', '')

        # Handle username: if not provided, generate from email
        if 'username' not in validated_data:
            email_prefix = validated_data['email'].split('@')[0]
            # Ensure uniqueness
            username = f"{email_prefix}_{uuid.uuid4().hex[:8]}"
            validated_data['username'] = username

        # Create User
        user = User.objects.create_user(**validated_data)

        # Update Customer profile (created via signal)
        # We need to refresh from db or access the related object
        if hasattr(user, 'customer'):
            customer = user.customer
            customer.name = full_name
            customer.phone_number = phone_number
            customer.save()

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer to allow login with email and password.
    """
    username_field = User.USERNAME_FIELD

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make username field optional so we can use email instead
        if self.username_field in self.fields:
            self.fields[self.username_field].required = False

        # Add email field
        self.fields['email'] = serializers.EmailField(required=False)

    def validate(self, attrs):
        # Map 'email' to 'username' if present, because the parent class expects 'username' (or USERNAME_FIELD)
        email = attrs.get('email')
        if email:
            # Standardize email casing for consistent lookup
            email = email.strip().lower()
            attrs['email'] = email
            attrs[self.username_field] = email

        try:
            data = super().validate(attrs)
            print(f"DEBUG_LOGIN_SUCCESS|Email:{email or attrs.get(self.username_field)}")
            return data
        except Exception as e:
            print(f"DEBUG_LOGIN_FAIL|Email:{email or attrs.get(self.username_field)}|Error:{e}")
            raise e

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['email'] = user.email
        return token


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        # We don't want to reveal if the user exists, so we just return the value.
        # The view will handle the logic.
        return value


class ResetPasswordSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(
        min_length=8,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        try:
            uid = urlsafe_base64_decode(attrs['uidb64']).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
            print(f"DEBUG_UID_FAIL|UIDB64:{attrs.get('uidb64')}|Error:{e}")
            raise serializers.ValidationError({"uidb64": "Invalid UID"})

        print(f"DEBUG_RESET|User:{user.email}|PK:{uid}|LastLogin:{user.last_login}|Active:{user.is_active}|PassHash:{user.password[:15]}...")
        token_valid = default_token_generator.check_token(user, attrs['token'])
        print(f"DEBUG_RESET|Token:{attrs['token']}|Valid:{token_valid}")
        
        if not token_valid:
            # Check if token would be valid with a slightly different state
            # (diagnostic only, don't change behavior here)
            print(f"DEBUG_RESET|FAILED_VALIDATION_FOR_TOKEN")
            raise serializers.ValidationError({"token": "Invalid or expired token"})

        attrs['user'] = user
        return attrs

from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator


from django.contrib.auth.models import User, Group, Permission

class PermissionSerializer(serializers.ModelSerializer):
    """
    Serializer for Django Permission model.
    """
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'content_type']


class GroupSerializer(serializers.ModelSerializer):
    """
    Serializer for Django Group model.
    """
    permissions = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Permission.objects.all(),
        required=False
    )

    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions']


class AddressSerializer(serializers.ModelSerializer):
    """
    Matches the UI screenshot exactly.
    """
    division = serializers.SlugRelatedField(slug_field='name', queryset=Division.objects.all())
    district = serializers.SlugRelatedField(slug_field='name', queryset=District.objects.all())
    sub_district = serializers.SlugRelatedField(slug_field='name', queryset=SubDistrict.objects.all())

    customer = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.all(), required=False)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)

    class Meta:
        model = Address
        fields = [
            'id', 'customer', 'customer_name', 'customer_email',
            'full_name', 'phone',           # Contact
            'address',                      # House/Road
            'division', 'district', 'sub_district',  # Location
            'address_type', 'is_default'    # Meta
        ]

    def create(self, validated_data):
        # Admin Dashboard creates addresses for other customers
        user = self.context['request'].user
        
        # If 'customer' is provided in the payload, DRF's PrimaryKeyRelatedField 
        # should have already converted it to a Customer instance in validated_data.
        if 'customer' not in validated_data or validated_data['customer'] is None:
            # Fallback for regular users only
            if not user.is_staff:
                validated_data['customer'] = getattr(user, 'customer', None)
        
        return super().create(validated_data)


class CustomerSerializer(serializers.ModelSerializer):
    """
    Read/Write customer details.
    """
    username = serializers.CharField(source='user.username', read_only=True)
    is_wholesaler = serializers.SerializerMethodField()
    is_email_verified = serializers.BooleanField(required=False)
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    addresses = AddressSerializer(many=True, read_only=True)
    total_orders = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    recent_orders = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()
    is_superuser = serializers.BooleanField(source='user.is_superuser', read_only=True)

    class Meta:
        model = Customer
        fields = [
            'id', 'user', 'username', 'first_name', 'last_name', 'name',
            'email', 'phone_number', 'customer_type',
            'avatar', 'social_avatar_url', 'is_wholesaler', 'is_email_verified', 'is_staff', 'is_superuser', 'created_at',
            'addresses', 'total_orders', 'total_spent', 'recent_orders', 'permissions', 'groups'
        ]
        read_only_fields = ['user', 'created_at']

    @extend_schema_field(serializers.IntegerField())
    def get_total_orders(self, obj):
        return obj.orders.count()

    @extend_schema_field(serializers.DecimalField(max_digits=12, decimal_places=2))
    def get_total_spent(self, obj):
        from django.db.models import Sum
        total = obj.orders.aggregate(total=Sum('total_amount'))['total']
        return total or 0

    @extend_schema_field(serializers.ListField(child=serializers.DictField()))
    def get_recent_orders(self, obj):
        recent = obj.orders.all()[:5]
        return [
            {
                'id': order.id,
                'created_at': order.created_at,
                'status': order.order_status.display_name if order.order_status else 'Pending',
                'total_amount': order.total_amount
            }
            for order in recent
        ]

    @extend_schema_field(serializers.BooleanField())
    def get_is_wholesaler(self, obj):
        return obj.is_wholesaler

    @extend_schema_field(serializers.BooleanField())
    def get_is_email_verified(self, obj):
        if obj.is_email_verified:
            return True
        return EmailAddress.objects.filter(user=obj.user, verified=True).exists()

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_permissions(self, obj):
        return list(obj.user.get_all_permissions())

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_groups(self, obj):
        return list(obj.user.groups.values_list('name', flat=True))

    def to_representation(self, instance):
        """
        Dynamically handle name and avatar fallbacks for the frontend.
        """
        data = super().to_representation(instance)
        
        # 1. Handle Name Fallback
        if not instance.name or not instance.name.strip():
            user = instance.user
            full_name = f"{user.first_name} {user.last_name}".strip()
            data['name'] = full_name if full_name else user.username
            
        # 2. Handle Avatar Fallback
        # If no custom avatar uploaded, check social_avatar_url
        if not instance.avatar:
            if instance.social_avatar_url:
                data['avatar'] = instance.social_avatar_url
            else:
                data['avatar'] = None
        else:
            # If there is a local avatar, super().to_representation 
            # already provided the absolute URL via the default field.
            pass
            
        return data

    def create(self, validated_data):
        user_data = validated_data.pop('user', {})
        # If user is not provided, we must create one. 
        # For admin creation, we usually expect email/username details.
        email = validated_data.get('email')
        name = validated_data.get('name')
        
        if not email:
            raise serializers.ValidationError({"email": "This field is required for user creation."})

        # Check if user already exists
        if User.objects.filter(email__iexact=email).exists():
            user = User.objects.get(email__iexact=email)
            if hasattr(user, 'customer'):
                raise serializers.ValidationError({"email": "A customer with this email already exists."})
        else:
            # Create a new user
            username = email.split('@')[0]
            # Ensure unique username
            base_username = username
            count = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{count}"
                count += 1
            
            # Default password for admin-created users (they should change it)
            temp_password = validated_data.pop('password', 'Sarker@123')
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=temp_password,
                first_name=name.split(' ')[0] if name else '',
                last_name=' '.join(name.split(' ')[1:]) if name and ' ' in name else ''
            )

        validated_data['user'] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        first_name = user_data.get('first_name')
        last_name = user_data.get('last_name')

        # Update User fields if provided
        user = instance.user
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if first_name is not None or last_name is not None:
            user.save()

        # Update Customer name automatically if first/last name changed
        if first_name is not None or last_name is not None:
            instance.name = f"{user.first_name} {user.last_name}".strip() or user.username

        return super().update(instance, validated_data)




# --- Location Serializers ---

class DivisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Division
        fields = ['id', 'name', 'bn_name', 'lat', 'long']

class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ['id', 'division', 'name', 'bn_name', 'lat', 'long']

class SubDistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubDistrict
        fields = ['id', 'district', 'name', 'bn_name']


class ResendVerificationEmailSerializer(serializers.Serializer):
    """Admin can supply any email to resend the verification link to."""
    email = serializers.EmailField(
        required=True,
        help_text="Email address to resend the verification link to."
    )


class AdminUserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model for admin-level management.
    """
    groups = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Group.objects.all(),
        required=False
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_staff', 'is_active', 'is_superuser', 'last_login', 'date_joined', 'groups'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']


