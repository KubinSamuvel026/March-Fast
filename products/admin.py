from django.contrib import admin
from .models import Product, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ["id", "name", "created_at"]
    search_fields = ["name"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display   = ["id", "name", "vendor", "price", "stock", "status", "category", "created_at"]
    list_filter    = ["status", "category", "created_at"]
    search_fields  = ["name", "vendor__username", "vendor__store_name"]
    ordering       = ["-created_at"]
    readonly_fields = ["created_at", "updated_at"]
