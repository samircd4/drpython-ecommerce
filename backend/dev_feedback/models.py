# pyrefly: ignore [missing-import]
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class DevFeedback(models.Model):
    class FeedbackType(models.TextChoices):
        FEEDBACK = 'feedback', 'Feedback'
        BUG = 'bug', 'Bug'
        UI = 'ui', 'UI'
        PERFORMANCE = 'performance', 'Performance'
        SECURITY = 'security', 'Security'
        SUGGESTION = 'suggestion', 'Suggestion'

    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        CRITICAL = 'critical', 'Critical'

    class Status(models.TextChoices):
        NEW = 'new', 'New'
        IN_PROGRESS = 'in_progress', 'In Progress'
        RESOLVED = 'resolved', 'Resolved'
        CLOSED = 'closed', 'Closed'

    title = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=FeedbackType.choices)
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )
    message = models.TextField()
    page_url = models.CharField(max_length=500, blank=True, null=True)
    screenshot = models.ImageField(
        upload_to='dev_feedback/screenshots/',
        blank=True,
        null=True,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_feedbacks',
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='submitted_feedbacks',
    )

    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Developer Feedback'
        verbose_name_plural = 'Developer Feedbacks'

    def save(self, *args, **kwargs):
        if self.screenshot:
            try:
                from django.core.files.uploadedfile import UploadedFile
                from utils.images import process_image_to_webp
                if isinstance(self.screenshot, UploadedFile):
                    optimized = process_image_to_webp(
                        self.screenshot, 
                        name_source=f"feedback-{self.id or 'new'}"
                    )
                    if optimized:
                        self.screenshot = optimized
            except Exception as e:
                print(f"Error optimizing DevFeedback screenshot: {e}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.get_type_display()}] {self.title} ({self.get_status_display()})"
