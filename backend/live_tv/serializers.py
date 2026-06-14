from rest_framework import serializers
from .models import Country, Channel

class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['id', 'name', 'slug', 'flag_icon']


class ChannelSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)

    class Meta:
        model = Channel
        fields = ['id', 'name', 'logo', 'stream_url', 'category', 'is_active', 'country', 'country_name']