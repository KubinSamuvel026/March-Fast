from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Vendor


@admin.register(Vendor)
class VendorAdmin(UserAdmin):
    list_display   = ["id", "username", "email", "store_name", "is_active", "created_at"]
    list_filter    = ["is_active", "is_staff", "created_at"]
    search_fields  = ["username", "email", "store_name"]
    ordering       = ["-created_at"]
    fieldsets      = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("username", "store_name", "phone_number", "account_holder_name", "avatar")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "created_at")}),
    )
    readonly_fields = ["created_at"]
    add_fieldsets  = (
        (None, {"classes": ("wide",), "fields": ("email", "username", "password1", "password2")}),
    )
