"""
Management command: python manage.py seed_data
Generates realistic test data: vendors, categories, products, orders, notifications.
"""
import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker

fake = Faker()


class Command(BaseCommand):
    help = "Seed the database with sample vendor, product, and order data."

    def add_arguments(self, parser):
        parser.add_argument("--vendors",  type=int, default=2,  help="Number of vendors")
        parser.add_argument("--products", type=int, default=20, help="Products per vendor")
        parser.add_argument("--orders",   type=int, default=50, help="Orders per vendor")

    def handle(self, *args, **options):
        from users.models import Vendor
        from products.models import Category, Product
        from orders.models import Order
        from notifications.models import Notification

        self.stdout.write(self.style.MIGRATE_HEADING("🌱  MarchFast — Seeding database..."))

        # ── Categories ──────────────────────────────────────────────────────
        category_names = ["Fashion", "Footwear", "Electronics", "Accessories", "Home & Living", "Beauty"]
        categories = []
        for name in category_names:
            cat, _ = Category.objects.get_or_create(name=name)
            categories.append(cat)
        self.stdout.write(self.style.SUCCESS(f"  ✓  {len(categories)} categories ready"))

        # ── Vendors ─────────────────────────────────────────────────────────
        vendors = []
        for i in range(options["vendors"]):
            email = fake.unique.email()
            vendor, created = Vendor.objects.get_or_create(
                email=email,
                defaults={
                    "username":            fake.user_name(),
                    "store_name":          fake.company(),
                    "phone_number":        fake.phone_number()[:20],
                    "account_holder_name": fake.name(),
                },
            )
            if created:
                vendor.set_password("Password@123")
                vendor.save()
            vendors.append(vendor)

        # Always ensure the demo vendor exists
        demo, created = Vendor.objects.get_or_create(
            email="gracestore@marchfast.com",
            defaults={
                "username":   "gracestore",
                "store_name": "Grace Store",
            },
        )
        if created:
            demo.set_password("Password@123")
            demo.save()
        vendors.append(demo)
        self.stdout.write(self.style.SUCCESS(f"  ✓  {len(vendors)} vendors ready (demo: gracestore@marchfast.com / Password@123)"))

        # ── Products ────────────────────────────────────────────────────────
        product_names = [
            "Premium Cotton Tee", "Slim Fit Chinos", "Leather Sneakers",
            "Wireless Earbuds", "Minimalist Watch", "Canvas Backpack",
            "Linen Shirt", "Running Shoes", "Smart Speaker",
            "Silk Scarf", "Denim Jacket", "Yoga Mat",
            "Face Serum", "Bamboo Toothbrush", "Stainless Water Bottle",
            "Throw Pillow", "Desk Lamp", "Phone Stand",
            "Knit Beanie", "Leather Wallet",
        ]
        total_products = 0
        for vendor in vendors:
            for j in range(options["products"]):
                name  = product_names[j % len(product_names)]
                stock = random.randint(0, 120)
                Product.objects.create(
                    vendor=vendor,
                    name=f"{name} #{j+1}",
                    price=Decimal(str(round(random.uniform(199, 4999), 2))),
                    stock=stock,
                    category=random.choice(categories),
                    description=fake.paragraph(nb_sentences=2),
                )
                total_products += 1
        self.stdout.write(self.style.SUCCESS(f"  ✓  {total_products} products created"))

        # ── Orders ──────────────────────────────────────────────────────────
        statuses = ["pending", "processing", "shipped", "delivered", "delivered", "delivered"]
        total_orders = 0
        for vendor in vendors:
            vendor_products = list(Product.objects.filter(vendor=vendor))
            if not vendor_products:
                continue
            for _ in range(options["orders"]):
                product = random.choice(vendor_products)
                qty     = random.randint(1, 5)
                Order.objects.create(
                    vendor=vendor,
                    product=product,
                    customer_name=fake.name(),
                    customer_email=fake.email(),
                    quantity=qty,
                    amount=product.price * qty,
                    status=random.choice(statuses),
                )
                total_orders += 1
        self.stdout.write(self.style.SUCCESS(f"  ✓  {total_orders} orders created"))

        # ── Notifications ───────────────────────────────────────────────────
        notif_templates = [
            ("🛍️ New order received!", "order"),
            ("⭐ You got a 5-star review!", "review"),
            ("⚠️ Stock running low on one of your products.", "stock"),
            ("🎉 Welcome to MarchFast Vendor Dashboard!", "system"),
        ]
        for vendor in vendors:
            for msg, ntype in notif_templates:
                Notification.objects.create(vendor=vendor, message=msg, type=ntype)

        self.stdout.write(self.style.SUCCESS("\n✅  Seed complete! Start selling on MarchFast 🚀"))
