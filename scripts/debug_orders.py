import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Marchfast.settings')
django.setup()

from users.models import Vendor
from rest_framework.test import APIClient

email = 'test@example.com'
password = 'testpass123'

vendor = Vendor.objects.filter(email=email).first()
if not vendor:
    raise SystemExit('Test vendor missing')

client = APIClient()
client.defaults['HTTP_HOST'] = '127.0.0.1'

resp = client.post('/api/auth/login/', {'email': email, 'password': password}, format='json')
print('login status', resp.status_code, resp.data)

if resp.status_code == 200:
    access = resp.data.get('access')
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
    r = client.get('/api/orders/recent/')
    print('recent orders status', r.status_code)
    print('recent orders content', r.data)
else:
    print('Login failed; cannot test orders endpoint')
