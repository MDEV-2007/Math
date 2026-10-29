from django.conf import settings
from django.db import models


class Visualization(models.Model):
    TOOL_CHOICES = [
        ('function_plotter', 'Function Plotter'),
        ('circle', 'Circle Tool'),
        ('triangle', 'Triangle Tool'),
        ('angles', 'Angles Tool'),
    ]

    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='visualizations')
    tool_type = models.CharField(max_length=50, choices=TOOL_CHOICES)

    data = models.JSONField()

    title = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)

    is_shared = models.BooleanField(default=False)
    share_link = models.CharField(max_length=255, unique=True, null=True, blank=True)
    views_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'visualizations'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title or self.tool_type} ({self.user.username})"
