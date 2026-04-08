import urllib.parse
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from jwt import decode as jwt_decode
from django.conf import settings

User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

class TokenAuthMiddleware:
    """
    Custom middleware that takes a token from the query string and authenticates the user.
    Usage: ws://domain.com/ws/chat/?token=<your_jwt_token>
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode()
        query_params = urllib.parse.parse_qs(query_string)
        token = query_params.get('token', [None])[0]
        scope['guest_id'] = query_params.get('guest_id', [None])[0]
        
        print(f"DEBUG: WS TokenAuthMiddleware - token: {'received' if token else 'missing'}, guest_id: {scope['guest_id']}")

        # Always ensure guest_id is in scope for the consumer
        scope['user'] = AnonymousUser()

        if token:
            try:
                # Validate token
                UntypedToken(token)
                # Decode payload (using SimpleJWT settings if possible, otherwise fallback to settings.SECRET_KEY)
                signing_key = getattr(settings, 'SIMPLE_JWT', {}).get('SIGNING_KEY', settings.SECRET_KEY)
                algorithm = getattr(settings, 'SIMPLE_JWT', {}).get('ALGORITHM', 'HS256')
                
                decoded_data = jwt_decode(token, signing_key, algorithms=[algorithm])
                user_id = decoded_data.get('user_id')
                
                if user_id:
                    try:
                        scope['user'] = await get_user(user_id)
                        # If we have a user, we don't need guest_id
                        scope['guest_id'] = None
                    except Exception as e:
                        print(f"WS User Lookup Error: {str(e)}")
                        scope['user'] = AnonymousUser()
            except (InvalidToken, TokenError, Exception) as e:
                # Token is invalid, fallback to AnonymousUser (which is already set)
                print(f"WS Auth Error: {str(e)}")

        return await self.inner(scope, receive, send)

