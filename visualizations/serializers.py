from rest_framework import serializers

from .models import Visualization


class VisualizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visualization
        fields = [
            'id', 'user', 'tool_type', 'data', 'title', 'description',
            'is_shared', 'share_link', 'views_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['user', 'is_shared', 'share_link', 'views_count']
