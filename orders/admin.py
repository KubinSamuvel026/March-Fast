from django.contrib import admin
from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display   = ["order_id", "vendor_name", "customer_name", "product_name", "amount", "status", "created_at"]
    list_filter    = ["status", "created_at"]
    search_fields  = ["order_id", "customer_name", "vendor__username", "product__name"]
    ordering       = ["-created_at"]
    readonly_fields = ["order_id", "created_at", "updated_at"]

    def vendor_name(self, obj):
        if obj.vendor:
            return obj.vendor.username or obj.vendor.email or "Unknown Vendor"
        return "No Vendor"
    vendor_name.short_description = "Vendor"

    def product_name(self, obj):
        if obj.product:
            return obj.product.name
        return "No Product"
    product_name.short_description = "Product"
