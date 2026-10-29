from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import TelegramLoginSession, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'points', 'coins', 'is_verified', 'created_at')
    list_filter = ('role', 'is_verified', 'is_staff')
    search_fields = ('username', 'email', 'telegram_username')
    fieldsets = UserAdmin.fieldsets + (
        ('ILM Math', {
            'fields': ('telegram_id', 'telegram_username', 'role', 'points', 'coins', 'bio',
                       'profile_picture', 'is_verified'),
        }),
    )


@admin.register(TelegramLoginSession)
class TelegramLoginSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'confirmed', 'telegram_username', 'created_at')
    list_filter = ('confirmed',)
