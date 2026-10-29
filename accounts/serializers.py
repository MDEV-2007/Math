from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role',
            'points', 'coins', 'bio', 'profile_picture', 'telegram_id',
            'telegram_username', 'is_verified', 'created_at',
        ]
        read_only_fields = ['id', 'points', 'coins', 'telegram_id', 'is_verified', 'created_at']
