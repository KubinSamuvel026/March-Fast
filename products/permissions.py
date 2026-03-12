"""
products/permissions.py
Custom DRF permission: only the product's owner vendor can modify it.
"""

from rest_framework.permissions import BasePermission


class IsProductOwner(BasePermission):
    """
    Object-level permission — allows access only to the product's owning vendor.
    Called after IsAuthenticated has already confirmed the user is logged in.
    """
    message = "You do not have permission to access this product."

    def has_object_permission(self, request, view, obj):
        return obj.vendor == request.user
