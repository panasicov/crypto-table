from django.conf import settings
from django.contrib import admin
from django.views.static import serve
from django.urls import path, re_path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('__debug__/', include('debug_toolbar.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/arbitrage_pairs/', include('arbitrage_pairs.urls')),
    re_path(r'^media/(?P<path>.*)$', serve,{'document_root': settings.MEDIA_ROOT}),
    re_path(r'^static/(?P<path>.*)$', serve,{'document_root': settings.STATIC_ROOT}),
]
