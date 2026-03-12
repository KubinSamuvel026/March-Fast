import os
import sys
import django

# Ensure the project root is on sys.path so Django settings can be imported
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Marchfast.settings')
django.setup()

from users.models import Vendor
from rest_framework.test import APIClient

email = 'test@example.com'
username = 'testuser'
password = 'testpass123'

vendor, created = Vendor.objects.get_or_create(email=email, defaults={'username': username})
if created:
    vendor.set_password(password)
    vendor.save()
    print('Created test vendor')
else:
    print('Test vendor already exists')

client = APIClient()
client.defaults['HTTP_HOST'] = '127.0.0.1'

# Login
resp = client.post('/api/auth/login/', {'email': email, 'password': password}, format='json')
print('login status', resp.status_code, resp.data)

if resp.status_code == 200:
    access = resp.data.get('access')
    print('access token length', len(access) if access else 'none')
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
    r = client.get('/api/products/')
    print('products status', r.status_code, r.data)
else:
    print('Login failed -- cannot test products endpoint')
