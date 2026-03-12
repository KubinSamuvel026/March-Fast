from django.contrib import admin
from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display   = ["order_id", "vendor", "customer_name", "product", "amount", "status", "created_at"]
    list_filter    = ["status", "created_at"]
    search_fields  = ["order_id", "customer_name", "vendor__username"]
    ordering       = ["-created_at"]
    readonly_fields = ["order_id", "created_at", "updated_at"]
