"""
Shared utility functions for consistent API responses across all apps.
"""
from rest_framework.response import Response
from rest_framework import status


def success_response(data=None, message="Success", status_code=status.HTTP_200_OK):
    """Return a standardised success envelope."""
    return Response(
        {"success": True, "message": message, "data": data},
        status=status_code,
    )


def error_response(message="An error occurred", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """Return a standardised error envelope."""
    return Response(
        {"success": False, "message": message, "errors": errors},
        status=status_code,
    )
