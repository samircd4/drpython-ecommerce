from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CountryViewSet, ChannelViewSet

router = DefaultRouter()
router.register(r'countries', CountryViewSet, basename='country')
router.register(r'channels', ChannelViewSet, basename='channel')

urlpatterns = [
    path('', include(router.urls)), 
]