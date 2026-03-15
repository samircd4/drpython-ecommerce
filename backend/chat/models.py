from django.db import models
from django.conf import settings



class Conversation(models.Model):
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversations',
        null=True,
        blank=True
    )
    guest_id = models.CharField(max_length=100, null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.customer:
            return f"Conversation with {self.customer.email}"
        return f"Conversation with Guest {self.guest_id}"

    class Meta:
        ordering = ['-updated_at']


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        null=True,
        blank=True
    )
    guest_id = models.CharField(max_length=100, null=True, blank=True)
    text = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='chat_images/', null=True, blank=True)
    video = models.FileField(upload_to='chat_videos/', null=True, blank=True)
    message_type = models.CharField(
        max_length=20,
        choices=[('text', 'Text'), ('image', 'Image'), ('video', 'Video')],
        default='text'
    )
    parent_message = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='replies'
    )
    reactions = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        sender_display = self.sender.email if self.sender else f"Guest {self.guest_id}"
        return f"Message from {sender_display} at {self.timestamp}"

    def save(self, *args, **kwargs):
        # Optimize Chat Image
        if self.image:
            try:
                from django.core.files.uploadedfile import UploadedFile
                if isinstance(self.image, UploadedFile):
                    from utils.images import convert_to_webp
                    optimized = convert_to_webp(self.image)
                    if optimized:
                        self.image = optimized
            except Exception as e:
                print(f"Error optimizing Chat image: {e}")
        
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['timestamp']
