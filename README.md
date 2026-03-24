# MarchFast

MarchFast is a full-stack ecommerce platform featuring a vendor dashboard and a customer storefront.

## Tech Stack
- **Backend:** Django + Django REST Framework
- **Frontend:** React (Vite)
- **Database:** PostgreSQL (SQLite supported for local dev)
- **Auth:** JWT (SimpleJWT)

---

## Features
- Vendor dashboard (product management, orders, analytics)
- Customer shopping website (browse products, cart, wishlist, checkout)
- Authentication (register/login/logout)
- REST API with consistent response structure

---

## Quick Start

### 1) Clone & Setup
```bash
git clone https://github.com/KubinSamuvel026/March-Fast.git
cd Marchfast
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2) Environment
```bash
cp .env.example .env
# Edit .env – set SECRET_KEY, DATABASE_URL, etc.
```

### 3) Database
```bash
# Create DB (PostgreSQL recommended):
createdb marchfast_db

python manage.py migrate
python manage.py seed_data  # seeds sample data
python manage.py createsuperuser
```

### 4) Run Backend
```bash
python manage.py runserver
```

### 5) Run Customer Frontend
```bash
cd files
npm install
npm run dev
```

---

## Repository Structure
```
Marchfast/
├── Marchfast/        # Django project settings + globals
├── analytics/        # Analytics APIs + dashboards
├── notifications/    # Notification system
├── orders/           # Order management
├── products/         # Products + categories
├── users/            # Vendor auth + profile
├── files/            # Customer React storefront
├── my-app/           # Vendor dashboard React app
├── manage.py
├── requirements.txt
└── .env.example
```

---

## API Base URL
`http://  https://api.marchfastn.shop/api/`

---

## Authentication
Protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## Notes
- The customer frontend uses `localStorage` for storing JWT tokens.
- Cart/wishlist actions require login.
- Products are publicly visible without authentication.
