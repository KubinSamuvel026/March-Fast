from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import Vendor


class VendorForm(UserCreationForm):
    """Django form for vendor creation / admin use."""
    class Meta:
        model  = Vendor
        fields = ["username", "email", "store_name", "phone_number", "account_holder_name"]


class VendorProfileForm(forms.ModelForm):
    class Meta:
        model  = Vendor
        fields = ["username", "store_name", "phone_number", "account_holder_name", "avatar"]
