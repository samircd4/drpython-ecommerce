from django.db import models

class Country(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    flag_icon = models.CharField(max_length=10, help_text="Emoji or icon identifier (e.g., 🇧🇩)", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Countries"
        ordering = ['name']

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Channel(models.Model):
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='channels', db_index=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='channels', db_index=True, null=True, blank=True)
    name = models.CharField(max_length=150)
    logo = models.URLField(max_length=500, blank=True, null=True, help_text="Direct URL of the channel logo image")
    stream_url = models.URLField(max_length=1000, help_text="Valid .m3u8 streaming link")
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.country.name})"