from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('__debug__/', include('debug_toolbar.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/arbitrage_pairs/', include('arbitrage_pairs.urls')),
]
