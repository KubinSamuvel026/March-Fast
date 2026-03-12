"""
notifications/utils.py
Helper function to programmatically create notifications.
Called from orders/views.py and product auto-triggers.
"""

from .models import Notification


def create_notification(vendor, message, notif_type="system"):
    """Create a notification record for the given vendor."""
    return Notification.objects.create(
        vendor=vendor,
        message=message,
        type=notif_type,
    )
