"""
Custom Vendor user model extending AbstractBaseUser.
Replaces Django's default User model for vendor-specific fields.
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class VendorManager(BaseUserManager):
    """Manager for the Vendor model."""

    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, username, password, **extra_fields)


class Vendor(AbstractBaseUser, PermissionsMixin):
    """
    Vendor user model.
    Each vendor has their own store and manages their own products & orders.
    """
    id                   = models.BigAutoField(primary_key=True)
    username             = models.CharField(max_length=100, unique=True)
    email                = models.EmailField(unique=True)
    store_name           = models.CharField(max_length=200, blank=True)
    phone_number         = models.CharField(max_length=20, blank=True)
    account_holder_name  = models.CharField(max_length=200, blank=True)
    avatar               = models.ImageField(upload_to="vendor_avatars/", blank=True, null=True)

    # Django required fields
    is_active  = models.BooleanField(default=True)
    is_staff   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = VendorManager()

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table    = "vendors"
        verbose_name = "Vendor"

    def __str__(self):
        return f"{self.username} — {self.store_name}"
