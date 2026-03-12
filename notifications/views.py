"""
Notification views — list & mark as read.
"""
from rest_framework import generics, permissions, status
from Marchfast.utils import success_response, error_response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """GET /api/notifications/ — returns all notifications for the vendor."""
    serializer_class   = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(vendor=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset        = self.get_queryset()
        unread_count    = queryset.filter(is_read=False).count()
        serializer      = self.get_serializer(queryset, many=True)
        return success_response(
            data={"notifications": serializer.data, "unread_count": unread_count}
        )


class NotificationMarkReadView(generics.UpdateAPIView):
    """PATCH /api/notifications/<id>/read/ — mark single notification as read."""
    serializer_class   = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names  = ["patch"]

    def get_queryset(self):
        return Notification.objects.filter(vendor=self.request.user)

    def update(self, request, *args, **kwargs):
        instance         = self.get_object()
        instance.is_read = True
        instance.save()
        return success_response(
            data=NotificationSerializer(instance).data,
            message="Notification marked as read.",
        )


class NotificationMarkAllReadView(generics.UpdateAPIView):
    """PATCH /api/notifications/mark-all-read/ — bulk mark all as read."""
    permission_classes = [permissions.IsAuthenticated]
    http_method_names  = ["patch"]

    def update(self, request, *args, **kwargs):
        count = Notification.objects.filter(
            vendor=request.user, is_read=False
        ).update(is_read=True)
        return success_response(message=f"{count} notifications marked as read.")
