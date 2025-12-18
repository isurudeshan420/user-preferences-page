from django.contrib import admin
from .models import UserProfile, UserPreferences


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Admin configuration for UserProfile
    """
    list_display = ("user", "first_name", "last_name")
    search_fields = ("user__username", "first_name", "last_name")
    ordering = ("user__username",)


@admin.register(UserPreferences)
class UserPreferencesAdmin(admin.ModelAdmin):
    """
    Admin configuration for UserPreferences
    """
    list_display = (
        "user",
        "theme",
        "language",
        "email_notifications",
        "push_notifications",
        "notification_frequency",
    )
    list_filter = (
        "theme",
        "language",
        "email_notifications",
        "push_notifications",
    )
    ordering = ("user__user__username",)
