"""
Order model — links a customer to a vendor's product.
"""
import uuid
from django.db import models


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending",    "Pending"),
        ("processing", "Processing"),
        ("shipped",    "Shipped"),
        ("delivered",  "Delivered"),
        ("cancelled",  "Cancelled"),
    ]

    id            = models.BigAutoField(primary_key=True)
    order_id      = models.CharField(max_length=20, unique=True, editable=False)
    vendor        = models.ForeignKey(
        "users.Vendor",
        on_delete=models.CASCADE,
        related_name="orders",
    )
    product       = models.ForeignKey(
        "products.Product",
        on_delete=models.SET_NULL,
        null=True,
        related_name="orders",
    )
    customer_name  = models.CharField(max_length=200)
    customer_email = models.EmailField(blank=True)
    quantity       = models.PositiveIntegerField(default=1)
    amount         = models.DecimalField(max_digits=10, decimal_places=2)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    notes          = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]

    def __str__(self):
        # Null-safe __str__ to avoid exceptions if related objects are missing in production data.
        vendor_name = "No Vendor"
        if self.vendor:
            vendor_name = self.vendor.username or self.vendor.email or "Unknown Vendor"

        product_name = "No Product"
        if self.product:
            product_name = self.product.name or f"Unnamed Product (ID: {self.product.id})"

        customer = self.customer_name or f"Unnamed Customer (Order ID: {self.order_id})"

        return f"{self.order_id} — {vendor_name} — {product_name} — {customer}"

    def save(self, *args, **kwargs):
        """Auto-generate a short unique order ID like MF-0001."""
        if not self.order_id:
            self.order_id = f"MF-{str(uuid.uuid4().int)[:6].upper()}"
        super().save(*args, **kwargs)
