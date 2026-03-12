"""
In-app notification model.
Notifications are created programmatically via signals or management commands.
"""
from django.db import models


class Notification(models.Model):
    TYPE_CHOICES = [
        ("order",   "New Order"),
        ("stock",   "Low Stock"),
        ("review",  "New Review"),
        ("system",  "System"),
    ]

    id         = models.BigAutoField(primary_key=True)
    vendor     = models.ForeignKey(
        "users.Vendor",
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    message    = models.TextField()
    type       = models.CharField(max_length=20, choices=TYPE_CHOICES, default="system")
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.type}] {self.message[:60]}"
