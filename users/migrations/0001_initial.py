from django.db import migrations, models
import django.contrib.auth.models


class Migration(migrations.Migration):
    initial      = True
    dependencies  = [("auth", "0012_alter_user_first_name_max_length")]

    operations = [
        migrations.CreateModel(
            name="Vendor",
            fields=[
                ("id",                  models.BigAutoField(primary_key=True)),
                ("password",            models.CharField(max_length=128, verbose_name="password")),
                ("last_login",          models.DateTimeField(blank=True, null=True)),
                ("is_superuser",        models.BooleanField(default=False)),
                ("username",            models.CharField(max_length=100, unique=True)),
                ("email",               models.EmailField(unique=True)),
                ("store_name",          models.CharField(blank=True, max_length=200)),
                ("phone_number",        models.CharField(blank=True, max_length=20)),
                ("account_holder_name", models.CharField(blank=True, max_length=200)),
                ("avatar",              models.ImageField(blank=True, null=True, upload_to="vendor_avatars/")),
                ("is_active",           models.BooleanField(default=True)),
                ("is_staff",            models.BooleanField(default=False)),
                ("created_at",          models.DateTimeField(auto_now_add=True)),
                ("updated_at",          models.DateTimeField(auto_now=True)),
                ("groups",              models.ManyToManyField(blank=True, related_name="vendor_groups", to="auth.group")),
                ("user_permissions",    models.ManyToManyField(blank=True, related_name="vendor_user_perms", to="auth.permission")),
            ],
            options={"db_table": "vendors"},
            managers=[("objects", django.contrib.auth.models.UserManager())],
        ),
    ]
