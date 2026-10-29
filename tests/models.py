from django.conf import settings
from django.db import models


class Problem(models.Model):
    SUBJECT_CHOICES = [
        ('math', 'Matematika'),
        ('geometry', 'Geometriya'),
        ('algebra', 'Algebra'),
        ('trigonometry', 'Trigonometriya'),
    ]

    TYPE_CHOICES = [
        ('mcq', "Ko'p variantli"),
        ('open_ended', 'Ochiq javob'),
        ('matching', 'Mos keltiruv'),
        ('image_based', 'Rasm asosida'),
        ('graph_based', 'Graf asosida'),
    ]

    DIFFICULTY_CHOICES = [
        (1, 'Juda oson'),
        (2, 'Oson'),
        (3, "O'rtacha"),
        (4, 'Qiyin'),
        (5, 'Juda qiyin'),
    ]

    id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=255)
    subject = models.CharField(max_length=50, choices=SUBJECT_CHOICES)
    topic = models.CharField(max_length=255)
    question_text = models.TextField()
    question_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    difficulty = models.IntegerField(choices=DIFFICULTY_CHOICES)

    options = models.JSONField(null=True, blank=True)
    correct_answer = models.CharField(max_length=255)

    solution_json = models.JSONField()

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_problems'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)

    total_attempts = models.IntegerField(default=0)
    total_correct = models.IntegerField(default=0)
    average_score = models.FloatField(default=0.0)

    class Meta:
        db_table = 'problems'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_by', 'created_at']),
            models.Index(fields=['subject', 'difficulty']),
            models.Index(fields=['is_published']),
        ]

    def __str__(self):
        return f"{self.title} (Level {self.difficulty})"

    def get_success_rate(self):
        if self.total_attempts == 0:
            return 0
        return (self.total_correct / self.total_attempts) * 100


class Attempt(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attempts')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='attempts')

    answer = models.JSONField()
    answer_text = models.TextField(blank=True)

    is_correct = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    partial_credit = models.FloatField(default=0.0)

    feedback = models.JSONField()

    submitted_at = models.DateTimeField(auto_now_add=True)
    time_taken_seconds = models.IntegerField(default=0)

    class Meta:
        db_table = 'attempts'
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['user', 'submitted_at']),
            models.Index(fields=['problem', 'is_correct']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.problem.title} ({self.score}%)"


class ShareLink(models.Model):
    id = models.BigAutoField(primary_key=True)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='share_links')
    unique_token = models.CharField(max_length=16, unique=True)
    access_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'share_links'

    def __str__(self):
        return f"{self.problem.title} -> {self.unique_token}"
