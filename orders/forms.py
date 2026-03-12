from django import forms
from .models import Order


class OrderForm(forms.ModelForm):
    class Meta:
        model  = Order
        fields = ["customer_name", "customer_email", "product", "quantity", "amount", "status", "notes"]

    def clean_quantity(self):
        qty = self.cleaned_data.get("quantity")
        if qty is not None and qty < 1:
            raise forms.ValidationError("Quantity must be at least 1.")
        return qty
