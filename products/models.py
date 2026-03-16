"""
Product model — each product belongs to a specific Vendor.
Status is automatically managed based on stock level.
"""
from django.db import models
from django.core.validators import MinValueValidator


class Category(models.Model):
    name       = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table    = "categories"
        verbose_name_plural = "categories"

    def __str__(self):
        # Null-safe category label in admin and logs; fallback if name is empty.
        return self.name or f"Unnamed Category (ID: {self.id})"


class Product(models.Model):
    """
    Core product entity.
    'status' is derived from stock: active / low (<15) / out (0).
    """
    STATUS_CHOICES = [
        ("active", "Active"),
        ("low",    "Low Stock"),
        ("out",    "Out of Stock"),
    ]

    id         = models.BigAutoField(primary_key=True)
    vendor     = models.ForeignKey(
        "users.Vendor",
        on_delete=models.CASCADE,
        related_name="products",
    )
    name       = models.CharField(max_length=255)
    price      = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    stock      = models.PositiveIntegerField(default=0)
    category   = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    image      = models.ImageField(upload_to="product_images/", blank=True, null=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "products"
        ordering = ["-created_at"]

    def __str__(self):
        # Null-safe __str__ for Product ensures missing FK data never raises.
        product_name = self.name or f"Unnamed Product (ID: {self.id})"

        vendor_name = "No Vendor"
        if self.vendor:
            vendor_name = self.vendor.username or self.vendor.email or "Unknown Vendor"

        category_name = "No Category"
        if self.category:
            category_name = self.category.name or f"Unnamed Category (ID: {self.category.id})"

        return f"{product_name} (₹{self.price}) — {vendor_name} — {category_name}"

    def save(self, *args, **kwargs):
        """Auto-compute status from stock level before saving."""
        if self.stock == 0:
            self.status = "out"
        elif self.stock < 15:
            self.status = "low"
        else:
            self.status = "active"
        super().save(*args, **kwargs)
