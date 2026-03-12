from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display   = ["id", "vendor", "type", "is_read", "created_at", "message"]
    list_filter    = ["type", "is_read", "created_at"]
    search_fields  = ["vendor__username", "message"]
    ordering       = ["-created_at"]
