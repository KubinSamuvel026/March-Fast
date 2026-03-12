"""
Django signals to auto-create notifications on key events.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender="orders.Order")
def notify_new_order(sender, instance, created, **kwargs):
    """Fire a notification when a new order is placed."""
    from .models import Notification
    if created:
        Notification.objects.create(
            vendor=instance.vendor,
            message=f"New order {instance.order_id} received from {instance.customer_name}!",
            type="order",
        )


@receiver(post_save, sender="products.Product")
def notify_low_stock(sender, instance, **kwargs):
    """Fire a notification when a product goes into low/out-of-stock."""
    from .models import Notification
    if instance.status == "low":
        Notification.objects.get_or_create(
            vendor=instance.vendor,
            message=f"'{instance.name}' is running low on stock ({instance.stock} left).",
            type="stock",
            is_read=False,
        )
    elif instance.status == "out":
        Notification.objects.create(
            vendor=instance.vendor,
            message=f"'{instance.name}' is out of stock!",
            type="stock",
        )
