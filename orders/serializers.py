from rest_framework import serializers
from .models import Order


class OrderSerializer(serializers.ModelSerializer):
    product_name  = serializers.CharField(source="product.name", read_only=True)
    product_image = serializers.ImageField(source="product.image", read_only=True)

    class Meta:
        model  = Order
        fields = [
            "id", "order_id", "customer_name", "customer_email",
            "product", "product_name", "product_image",
            "quantity", "amount", "status", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "order_id", "created_at", "updated_at"]


class OrderStatusSerializer(serializers.ModelSerializer):
    """Minimal serializer for status-only PATCH."""
    class Meta:
        model  = Order
        fields = ["id", "order_id", "status"]

    def validate_status(self, value):
        allowed = [c[0] for c in Order.STATUS_CHOICES]
        if value not in allowed:
            raise serializers.ValidationError(f"Status must be one of: {', '.join(allowed)}")
        return value


class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Order
        fields = ["product", "customer_name", "customer_email", "quantity", "amount", "notes"]

    def create(self, validated_data):
        # If created by an authenticated vendor, use that user. Otherwise derive the vendor from the product.
        product = validated_data.get("product")
        if product is not None and hasattr(product, "vendor"):
            validated_data["vendor"] = product.vendor
        else:
            # Fallback to request user when running in an authenticated context.
            validated_data["vendor"] = self.context["request"].user
        return super().create(validated_data)
