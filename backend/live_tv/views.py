from rest_framework import viewsets, permissions
from .models import Country, Channel
from .serializers import CountrySerializer, ChannelSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Admin users get full write access.
    Authenticated users get read-only access (GET, HEAD, OPTIONS).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_staff

class CountryViewSet(viewsets.ModelViewSet):
    """
    Admin: full CRUD on countries.
    Authenticated users: read-only.
    """
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [IsAdminOrReadOnly]


class ChannelViewSet(viewsets.ModelViewSet):
    """
    Admin: full CRUD on channels.
    Authenticated users: read-only, filterable by ?country_slug=<slug>.
    """
    serializer_class = ChannelSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        # Return only active channels
        queryset = Channel.objects.filter(is_active=True).select_related('country')
        
        # Filter by country slug if provided as a query param (e.g. /channels/?country_slug=bd)
        country_slug = self.request.query_params.get('country_slug', None)
        if country_slug is not None:
            queryset = queryset.filter(country__slug=country_slug)
            
        return queryset