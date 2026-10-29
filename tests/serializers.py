from rest_framework import serializers

from .models import Attempt, Problem


class ProblemSerializer(serializers.ModelSerializer):
    success_rate = serializers.FloatField(source='get_success_rate', read_only=True)

    class Meta:
        model = Problem
        fields = [
            'id', 'title', 'subject', 'topic', 'question_text', 'question_type',
            'difficulty', 'options', 'correct_answer', 'solution_json',
            'created_by', 'created_at', 'updated_at', 'is_published', 'is_archived',
            'total_attempts', 'total_correct', 'average_score', 'success_rate',
        ]
        read_only_fields = ['created_by', 'total_attempts', 'total_correct', 'average_score']


class ProblemPublicSerializer(serializers.ModelSerializer):
    """Serializer for students: hides correct_answer and solution."""

    class Meta:
        model = Problem
        fields = ['id', 'title', 'subject', 'topic', 'question_text', 'question_type',
                   'difficulty', 'options']


class AttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attempt
        fields = [
            'id', 'user', 'problem', 'answer', 'answer_text', 'is_correct',
            'score', 'partial_credit', 'feedback', 'submitted_at', 'time_taken_seconds',
        ]
        read_only_fields = ['user', 'is_correct', 'score', 'partial_credit', 'feedback']
