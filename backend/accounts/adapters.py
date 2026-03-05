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
            # If the user doesn't have a usable password, set a random one
            # so they can use the "Forgot Password" flow.
            if not user.has_usable_password():
                from django.contrib.auth.models import User
                user.set_password(User.objects.make_random_password())
                user.save()
            self._sync_customer_data(user, sociallogin)
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

        # For NEW users, ensure username is set and unique
        if not user.username:
            user.username = user.email.split('@')[0] if user.email else uuid.uuid4().hex[:10]
            
        from django.contrib.auth.models import User
        # Check if this username is already taken by ANOTHER user
        original_username = user.username
        while User.objects.filter(username=user.username).exists():
            user.username = f"{original_username}_{uuid.uuid4().hex[:5]}"
            
        # Set a random password so the user can use the "Forgot Password" flow 
        # to set a known password for email/password login later.
        user.set_password(User.objects.make_random_password())
            
        return user

    def save_user(self, request, sociallogin, form=None):
        """
        Saves a newly signed up social user.
        """
        user = super().save_user(request, sociallogin, form)
        self._sync_customer_data(user, sociallogin)
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
