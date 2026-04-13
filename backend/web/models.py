from django.db import models
from django.conf import settings


class ContactMessage(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name} ({self.email})"

class NewsletterSubscription(models.Model):
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.email


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('order_update', 'Order Update'),
        ('promotion', 'Promotion'),
        ('system', 'System'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications'
    )
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='system')
    title = models.CharField(max_length=255)
    message = models.TextField()
    link = models.URLField(max_length=500, blank=True, null=True, help_text="Action URL for the notification")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} → {self.user.email}"

class StoreConfiguration(models.Model):
    website_name = models.CharField(max_length=255, default="Sarker Shop", blank=True, null=True)
    dashboard_logo = models.ImageField(upload_to='web/logo/', blank=True, null=True)
    logo_dark = models.ImageField(upload_to='web/logo/', blank=True, null=True)
    logo_light = models.ImageField(upload_to='web/logo/', blank=True, null=True)
    favicon = models.ImageField(upload_to='web/favicon/', blank=True, null=True)
    currency = models.CharField(max_length=50, default="BDT", blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    support_phone = models.CharField(max_length=50, blank=True, null=True)
    location = models.TextField(blank=True, null=True)
    facebook_url = models.URLField(max_length=500, blank=True, null=True)
    instagram_url = models.URLField(max_length=500, blank=True, null=True)
    twitter_url = models.URLField(max_length=500, blank=True, null=True)
    linkedin_url = models.URLField(max_length=500, blank=True, null=True)
    youtube_url = models.URLField(max_length=500, blank=True, null=True)
    whatsapp_url = models.CharField(max_length=500, blank=True, null=True)
    telegram_url = models.URLField(max_length=500, blank=True, null=True)
    tiktok_url = models.URLField(max_length=500, blank=True, null=True)
    messenger_url = models.URLField(max_length=500, blank=True, null=True)
    
    timezone = models.CharField(max_length=100, default="Asia/Dhaka", blank=True, null=True)
    currency_symbol = models.CharField(max_length=10, default="৳", blank=True, null=True)
    show_website_name = models.BooleanField(default=False)

    # Payment Settings
    is_cod_enabled = models.BooleanField(default=True)
    is_online_payment_enabled = models.BooleanField(default=False)
    bkash_number = models.CharField(max_length=20, blank=True, null=True)
    nagad_number = models.CharField(max_length=20, blank=True, null=True)
    rocket_number = models.CharField(max_length=20, blank=True, null=True)
    

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Global Store Configuration"
