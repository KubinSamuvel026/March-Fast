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
        return self.name


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
        vendor_name = self.vendor.username if self.vendor else "No Vendor"
        category_name = self.category.name if self.category else "No Category"
        return f"{self.name} (₹{self.price}) — {vendor_name} — {category_name}"

    def save(self, *args, **kwargs):
        """Auto-compute status from stock level before saving."""
        if self.stock == 0:
            self.status = "out"
        elif self.stock < 15:
            self.status = "low"
        else:
            self.status = "active"
        super().save(*args, **kwargs)
