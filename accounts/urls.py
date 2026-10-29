from django.urls import path

from . import views

urlpatterns = [
    path('telegram/start/', views.telegram_start, name='telegram_start'),
    path('telegram/status/<str:session_id>/', views.telegram_status, name='telegram_status'),
    path('dev-login/', views.dev_login, name='dev_login'),
    path('user/me/', views.get_current_user, name='get_current_user'),
]
