from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
import uuid

class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """
        Invoked just after a user successfully authenticates via a
        social provider, but before the login is actually processed.
        
        This allows us to connect a social account to an existing user
        if the email addresses match.
        """
        # 1. If user is already authenticated and has social account, sync and return
        if sociallogin.is_existing:
            user = sociallogin.user
            # ONLY set a random password if the account is unusable (empty/invalid hash)
            # and it doesn't already have one. This prevents changing valid passwords
            # Or invalidating reset tokens during social login attempts.
            if not user.has_usable_password():
                print(f"DEBUG_SOCIAL|SettingRandomPassFor:{user.email}")
                import secrets
                user.set_password(secrets.token_urlsafe(16))
                user.save()
                print(f"DEBUG_SOCIAL|RandomPassSetFor:{user.email}|NewHashSet")
            else:
                print(f"DEBUG_SOCIAL|UserHasUsablePass:{user.email}|NoChange")
            
            try:
                self._sync_customer_data(user, sociallogin)
            except Exception as e:
                print(f"Error syncing customer data for social user: {e}")
            return

        # 2. Check if a user with this email already exists
        email = sociallogin.user.email
        if not email:
            return

        from django.contrib.auth.models import User
        try:
            user = User.objects.get(email=email)
            # 3. Connect the social account to the existing user
            sociallogin.connect(request, user)
            self._sync_customer_data(user, sociallogin)
        except User.DoesNotExist:
            pass

    def populate_user(self, request, sociallogin, data):
        """
        Hook that can be used to further customize the user instance.
        """
        user = super().populate_user(request, sociallogin, data)
        
        # If user already exists (e.g. connected in pre_social_login),
        # do not touch the username.
        if user.pk:
            return user

        if not user.username:
            user.username = user.email.split('@')[0] if user.email else uuid.uuid4().hex[:10]
            
        from django.contrib.auth.models import User
        import secrets
        # Check if this username is already taken by ANOTHER user
        original_username = user.username
        while User.objects.filter(username=user.username).exists():
            user.username = f"{original_username}_{uuid.uuid4().hex[:5]}"
            
        # Set a random password so the user can use the "Forgot Password" flow 
        # to set a known password for email/password login later.
        user.set_password(secrets.token_urlsafe(16))
            
        return user

    def save_user(self, request, sociallogin, form=None):
        """
        Saves a newly signed up social user.
        """
        user = super().save_user(request, sociallogin, form)
        self._sync_customer_data(user, sociallogin)
        
        # Send Welcome Email for new social users (matches manual registration flow)
        try:
            from utils.emails import send_template_email
            from django.conf import settings
            
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            
            # Since social login auto-verifies, just send them to their dashboard
            verify_link = f"{frontend_url}/dashboard"
            logo_url = "https://sarker.shop/static/images/logo.png"
            
            full_name = getattr(user, 'customer', None).name if hasattr(user, 'customer') else user.username
            
            context = {
                'full_name': full_name,
                'verify_link': verify_link,
                'logo_url': logo_url,
                'is_social': True,
            }
            send_template_email(
                subject="Welcome to Sarker Shop!", 
                template_name='welcome_email.html', 
                context=context, 
                recipient_list=[user.email]
            )
        except Exception as e:
            print(f"DEBUG_SOCIAL_EMAIL|Failed to send welcome email: {e}")
            
        return user

    def _sync_customer_data(self, user, sociallogin):
        from accounts.models import Customer
        customer, created = Customer.objects.get_or_create(user=user)
        
        # Sync Email if missing
        if not customer.email:
            customer.email = user.email
            
        # Sync Name
        full_name = f"{user.first_name} {user.last_name}".strip()
        if not full_name:
            full_name = sociallogin.account.extra_data.get('name')
        if full_name:
            customer.name = full_name
            
        # Sync Avatar
        if sociallogin.account.provider == 'google':
            avatar_url = sociallogin.account.extra_data.get('picture')
            if avatar_url:
                customer.social_avatar_url = avatar_url
        elif sociallogin.account.provider == 'facebook':
            # facebook usually gives picture in extra_data or via graph
            # check extra_data first
            picture_obj = sociallogin.account.extra_data.get('picture')
            if isinstance(picture_obj, dict):
                avatar_url = picture_obj.get('data', {}).get('url')
                if avatar_url:
                    customer.social_avatar_url = avatar_url
            else:
                avatar_url = f"https://graph.facebook.com/{sociallogin.account.uid}/picture?type=large"
                customer.social_avatar_url = avatar_url

        customer.save()

from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings
from utils.emails import send_template_email

class MyAccountAdapter(DefaultAccountAdapter):
    def send_mail(self, template_prefix, email, context):
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        logo_url = "https://sarker.shop/static/images/logo.png"

        # Email Verification / Welcome
        if template_prefix in ['account/email/email_confirmation', 'account/email/email_confirmation_signup']:
            template_name = 'welcome_email.html' if 'signup' in template_prefix else 'verification_email.html'
            subject = "Welcome to Sarker Shop!" if 'signup' in template_prefix else "Verify Your Email - Sarker Shop"
            
            key = context['key']
            verify_link = f"{frontend_url}/verify-email/{key}"
            
            user = context.get('user')
            full_name = 'Valued Customer'
            if user:
                full_name = f"{user.first_name} {user.last_name}".strip() or user.username
                
            custom_context = {
                'full_name': full_name,
                'verify_link': verify_link,
                'logo_url': logo_url,
            }
            send_template_email(
                subject=subject, 
                template_name=template_name, 
                context=custom_context, 
                recipient_list=[email], 
                tags=['verification']
            )

        # Password Reset
        elif template_prefix == 'account/email/password_reset_key':
            subject = "Reset Your Password - Sarker Shop"
            
            uid = context.get('uid')
            token = context.get('token')
            
            if not uid and hasattr(context.get('user'), 'pk'):
                from django.utils.http import urlsafe_base64_encode
                from django.utils.encoding import force_bytes
                uid = urlsafe_base64_encode(force_bytes(context.get('user').pk))
            
            reset_link = context.get('password_reset_url')
            if not reset_link:
                reset_link = f"{frontend_url}/auth/reset-password/{uid}/{token}" # Adjusted frontend URL format assuming standard auth

            custom_context = {
                'reset_link': reset_link,
                'logo_url': logo_url,
            }
            send_template_email(
                subject=subject, 
                template_name='password_reset_email.html', 
                context=custom_context, 
                recipient_list=[email], 
                tags=['password_reset']
            )
        else:
            # Fallback to default
            super().send_mail(template_prefix, email, context)

