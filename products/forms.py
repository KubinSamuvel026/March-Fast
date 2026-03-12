from django import forms
from .models import Product


class ProductForm(forms.ModelForm):
    class Meta:
        model  = Product
        fields = ["name", "price", "stock", "category", "image", "description"]
        widgets = {
            "description": forms.Textarea(attrs={"rows": 4}),
        }

    def clean_price(self):
        price = self.cleaned_data.get("price")
        if price is not None and price < 0:
            raise forms.ValidationError("Price cannot be negative.")
        return price
