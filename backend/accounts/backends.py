from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        # Allow authentication with email if username is not provided
        email = kwargs.get('email', username)
        
        try:
            print(f"DEBUG_AUTH|EmailLookup:{email}")
            user = User.objects.get(email__iexact=email)
            print(f"DEBUG_AUTH|FoundUser:{user.email}|ID:{user.id}")
            if user.check_password(password):
                if self.user_can_authenticate(user):
                    print(f"DEBUG_AUTH|Validated:{user.email}")
                    return user
                print(f"DEBUG_AUTH|CannotAuthenticate:{user.email}")
            else:
                print(f"DEBUG_AUTH|PasswordWrong:{user.email}")
        except User.DoesNotExist:
            print(f"DEBUG_AUTH|UserNotFound:{email}")
            return None
        return None
