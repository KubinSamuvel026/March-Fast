"""
MarchFast Backend — Root URL Configuration
All API routes are prefixed with /api/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    # Authentication endpoints
    path("api/auth/", include("users.urls")),

    # Core app endpoints
    path("api/products/",     include("products.urls")),
    path("api/orders/",       include("orders.urls")),
    path("api/analytics/",    include("analytics.urls")),
    path("api/notifications/",include("notifications.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
