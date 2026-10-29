from django.contrib import admin

from .models import Visualization


@admin.register(Visualization)
class VisualizationAdmin(admin.ModelAdmin):
    list_display = ('title', 'tool_type', 'user', 'is_shared', 'views_count', 'created_at')
    list_filter = ('tool_type', 'is_shared')
    search_fields = ('title', 'user__username')
