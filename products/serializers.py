from rest_framework import serializers
from .models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ["id", "name"]


class ProductSerializer(serializers.ModelSerializer):
    """Full product serializer — includes category name for read, id for write."""
    category_name = serializers.CharField(source="category.name", read_only=True)
    vendor_name   = serializers.CharField(source="vendor.store_name", read_only=True)

    class Meta:
        model  = Product
        fields = [
            "id", "name", "price", "stock", "category", "category_name",
            "status", "image", "description", "vendor", "vendor_name",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "status", "vendor", "created_at", "updated_at"]


class ProductCreateSerializer(serializers.ModelSerializer):
    """Used for creating / updating — vendor is injected from request."""
    class Meta:
        model  = Product
        fields = ["id", "name", "price", "stock", "category", "image", "description"]

    def create(self, validated_data):
        # Vendor is set from the authenticated user in the view
        validated_data["vendor"] = self.context["request"].user
        return super().create(validated_data)
