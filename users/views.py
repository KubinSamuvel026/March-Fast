"""
Authentication and vendor profile views.
"""
from rest_framework import generics, permissions, status
from rest_framework_simplejwt.views import TokenObtainPairView
from Marchfast.utils import success_response, error_response
from .models import Vendor
from .serializers import (
    VendorRegisterSerializer,
    VendorProfileSerializer,
    VendorPasswordChangeSerializer,
    MarchFastTokenSerializer,
)


class VendorRegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — public endpoint."""
    queryset         = Vendor.objects.all()
    serializer_class = VendorRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            vendor = serializer.save()
            return success_response(
                data=VendorProfileSerializer(vendor).data,
                message="Vendor registered successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        return error_response(errors=serializer.errors)


class MarchFastTokenView(TokenObtainPairView):
    """POST /api/auth/login/ — returns access + refresh JWT tokens."""
    serializer_class = MarchFastTokenSerializer


class VendorProfileView(generics.RetrieveUpdateAPIView):
    """GET / PATCH /api/auth/profile/ — authenticated vendor only."""
    serializer_class   = VendorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return success_response(data=serializer.data)

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        serializer = self.get_serializer(
            self.get_object(), data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return success_response(data=serializer.data, message="Profile updated.")
        return error_response(errors=serializer.errors)


class VendorPasswordChangeView(generics.UpdateAPIView):
    """PATCH /api/auth/password/ — change own password."""
    serializer_class   = VendorPasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return success_response(message="Password updated successfully.")
        return error_response(errors=serializer.errors)
