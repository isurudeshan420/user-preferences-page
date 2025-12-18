from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)

    def __str__(self):
        return self.user.username

class UserPreferences(models.Model):
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='preferences')
    theme = models.CharField(max_length=50, default='light')
    language = models.CharField(max_length=50, default='en')
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    notification_frequency = models.CharField(max_length=50, default='daily')
    font_style = models.CharField(max_length=50, default='Arial')
    font_size = models.PositiveIntegerField(default=12)

    def __str__(self):
        return f"{self.user.user.username} preferences"
