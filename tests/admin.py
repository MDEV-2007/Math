from django.contrib import admin

from .models import Attempt, Problem, ShareLink


@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'topic', 'difficulty', 'question_type',
                     'is_published', 'total_attempts', 'average_score', 'created_by')
    list_filter = ('subject', 'difficulty', 'question_type', 'is_published', 'is_archived')
    search_fields = ('title', 'topic', 'question_text')


@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'problem', 'is_correct', 'score', 'submitted_at')
    list_filter = ('is_correct', 'submitted_at')
    search_fields = ('user__username', 'problem__title')


@admin.register(ShareLink)
class ShareLinkAdmin(admin.ModelAdmin):
    list_display = ('problem', 'unique_token', 'access_count', 'created_at')
    search_fields = ('unique_token', 'problem__title')
