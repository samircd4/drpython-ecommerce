from django.utils import timezone
from .models import StoreConfiguration

class TimezoneMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            config = StoreConfiguration.load()
            if config.timezone:
                timezone.activate(config.timezone)
            else:
                timezone.deactivate()
        except Exception:
            # Fallback if DB is not ready or other issues
            timezone.deactivate()
            
        return self.get_response(request)
