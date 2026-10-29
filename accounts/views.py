import uuid
from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import TelegramLoginSession, User
from .serializers import UserSerializer

SESSION_TTL = timedelta(minutes=10)


@api_view(['POST'])
@permission_classes([AllowAny])
def telegram_start(request):
    """POST /api/auth/telegram/start/ - begin a Telegram login handshake."""

    if not settings.TELEGRAM_BOT_USERNAME:
        return Response({
            "error": "Telegram bot not configured",
            "message": "Set TELEGRAM_BOT_TOKEN / TELEGRAM_BOT_USERNAME in .env, "
                       "or use /api/auth/dev-login/ while developing.",
        }, status=503)

    session = TelegramLoginSession.objects.create(session_id=uuid.uuid4().hex)

    return Response({
        "session_id": session.session_id,
        "telegram_login_url": f"https://t.me/{settings.TELEGRAM_BOT_USERNAME}?start={session.session_id}",
        "message": "Click the link and confirm login in Telegram",
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def telegram_status(request, session_id):
    """GET /api/auth/telegram/status/<session_id>/ - poll for confirmation."""

    try:
        session = TelegramLoginSession.objects.get(session_id=session_id)
    except TelegramLoginSession.DoesNotExist:
        return Response({"status": "not_found"}, status=404)

    if timezone.now() - session.created_at > SESSION_TTL:
        return Response({"status": "expired"})

    if session.confirmed and session.token:
        user = User.objects.get(telegram_id=session.telegram_id)
        return Response({
            "status": "confirmed",
            "token": session.token,
            "user": UserSerializer(user).data,
        })

    return Response({"status": "pending"})


@api_view(['POST'])
@permission_classes([AllowAny])
def dev_login(request):
    """
    POST /api/auth/dev-login/ - DEBUG-only shortcut so the app is usable
    without a live Telegram bot. Not available when DEBUG=False.
    """

    if not settings.DEBUG:
        return Response({"error": "Not available in production"}, status=403)

    username = request.data.get('username', '').strip()
    role = request.data.get('role', 'student')

    if not username:
        return Response({"error": "username is required"}, status=400)
    if role not in dict(User.ROLE_CHOICES):
        return Response({"error": "invalid role"}, status=400)

    user, _ = User.objects.get_or_create(
        username=username,
        defaults={'role': role, 'is_verified': True},
    )
    if user.role != role:
        user.role = role
        user.save(update_fields=['role'])

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        "success": True,
        "token": token.key,
        "user": UserSerializer(user).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """GET /api/auth/user/me/ - requires Authorization: Token <token>"""

    return Response(UserSerializer(request.user).data)
