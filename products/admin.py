from django.contrib import admin
from .models import Product, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ["id", "name", "created_at"]
    search_fields = ["name"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display   = ["id", "name", "vendor_name", "price", "stock", "status", "category_name", "product_image", "created_at"]
    list_filter    = ["status", "category", "created_at"]
    search_fields  = ["name", "vendor__username", "vendor__store_name"]
    ordering       = ["-created_at"]
    readonly_fields = ["created_at", "updated_at"]

    def vendor_name(self, obj):
        if obj.vendor:
            return obj.vendor.username or obj.vendor.email or "Unknown Vendor"
        return "No Vendor"
    vendor_name.short_description = "Vendor"

    def category_name(self, obj):
        if obj.category:
            return obj.category.name
        return "No Category"
    category_name.short_description = "Category"

    def product_image(self, obj):
        if obj.image and hasattr(obj.image, "url"):
            return obj.image.url
        return "-"
    product_image.short_description = "Image URL"
