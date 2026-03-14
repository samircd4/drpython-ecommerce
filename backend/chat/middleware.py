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

        if not token:
            guest_id = query_params.get('guest_id', [None])[0]
            scope['user'] = AnonymousUser()
            scope['guest_id'] = guest_id
            return await self.inner(scope, receive, send)

        try:
            # Validate token
            UntypedToken(token)
            # Decode payload
            decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = decoded_data.get('user_id')
            scope['user'] = await get_user(user_id)
            scope['guest_id'] = None
        except (InvalidToken, TokenError, Exception):
            # Token is invalid
            guest_id = query_params.get('guest_id', [None])[0]
            scope['user'] = AnonymousUser()
            scope['guest_id'] = guest_id

        return await self.inner(scope, receive, send)
