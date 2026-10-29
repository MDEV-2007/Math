from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from tests.urls import attempts_urlpatterns, share_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/tests/', include('tests.urls')),
    path('api/attempts/', include((attempts_urlpatterns, 'attempts'))),
    path('api/share/', include((share_urlpatterns, 'share'))),
    path('api/visualizations/', include('visualizations.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
