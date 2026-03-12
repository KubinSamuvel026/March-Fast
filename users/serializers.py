"""
Serializers for vendor registration, login and profile management.
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import Vendor


class VendorRegisterSerializer(serializers.ModelSerializer):
    """Handles new vendor sign-up with password confirmation."""
    password         = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model  = Vendor
        fields = [
            "id", "username", "email", "password", "password_confirm",
            "store_name", "phone_number", "account_holder_name",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        return Vendor.objects.create_user(**validated_data)


class VendorProfileSerializer(serializers.ModelSerializer):
    """Read/update vendor profile (no password field)."""
    class Meta:
        model  = Vendor
        fields = [
            "id", "username", "email", "store_name",
            "phone_number", "account_holder_name", "avatar", "created_at",
        ]
        read_only_fields = ["id", "email", "created_at"]


class VendorPasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


class MarchFastTokenSerializer(TokenObtainPairSerializer):
    """Extend JWT payload with vendor details."""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"]   = user.username
        token["store_name"] = user.store_name
        token["email"]      = user.email
        return token
