"""
Analytics views — aggregated data for the vendor dashboard.
All queries are scoped to the authenticated vendor.
"""
from datetime import timedelta, date
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncDate, TruncWeek
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework import permissions
from Marchfast.utils import success_response
from orders.models import Order
from products.models import Product


class DashboardStatsView(APIView):
    """
    GET /api/analytics/dashboard/
    Returns: total_revenue, total_orders, active_products, avg_rating (placeholder),
    plus weekly_sales and category_distribution for charts.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        vendor = request.user

        total_revenue = (
            Order.objects.filter(vendor=vendor, status="delivered")
            .aggregate(total=Sum("amount"))["total"] or 0
        )
        total_orders = Order.objects.filter(vendor=vendor).count()
        active_products = Product.objects.filter(vendor=vendor, status="active").count()

        # Avg rating: placeholder (extend with a Review model if needed)
        avg_rating = 4.8

        # Weekly sales: revenue for the last 7 days (including today)
        today = timezone.now().date()
        start_date = today - timedelta(days=6)
        sales = (
            Order.objects.filter(vendor=vendor, created_at__date__gte=start_date)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(revenue=Sum("amount"))
            .order_by("day")
        )
        sales_by_day = {row["day"]: float(row["revenue"] or 0) for row in sales}
        weekly_sales = [sales_by_day.get(start_date + timedelta(days=i), 0.0) for i in range(7)]

        # Category distribution (count of products per category)
        category_qs = (
            Product.objects.filter(vendor=vendor)
            .values("category__name")
            .annotate(count=Count("id"))
        )
        category_distribution = {
            (row.get("category__name") or "Uncategorised"): row["count"]
            for row in category_qs
        }

        return success_response(
            data={
                "total_revenue":        float(total_revenue),
                "total_orders":         total_orders,
                "active_products":      active_products,
                "avg_rating":           avg_rating,
                "revenue_change":       0,
                "weekly_sales":         weekly_sales,
                "category_distribution": category_distribution,
            }
        )


class SalesPerDayView(APIView):
    """
    GET /api/analytics/sales-per-day/?days=30
    Returns daily revenue for the last N days (default 30).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        days    = int(request.query_params.get("days", 30))
        since   = timezone.now() - timedelta(days=days)
        vendor  = request.user

        data = (
            Order.objects.filter(vendor=vendor, created_at__gte=since)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(revenue=Sum("amount"), orders=Count("id"))
            .order_by("day")
        )

        chart_data = [
            {"date": str(row["day"]), "revenue": float(row["revenue"]), "orders": row["orders"]}
            for row in data
        ]
        return success_response(data=chart_data)


class WeeklySalesView(APIView):
    """
    GET /api/analytics/weekly-sales/
    Returns aggregated weekly revenue for the last 7 weeks.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        since  = timezone.now() - timedelta(weeks=7)
        vendor = request.user

        data = (
            Order.objects.filter(vendor=vendor, created_at__gte=since)
            .annotate(week=TruncWeek("created_at"))
            .values("week")
            .annotate(revenue=Sum("amount"), orders=Count("id"))
            .order_by("week")
        )

        chart_data = [
            {"week": str(row["week"].date()), "revenue": float(row["revenue"]), "orders": row["orders"]}
            for row in data
        ]
        return success_response(data=chart_data)


class CategoryDistributionView(APIView):
    """
    GET /api/analytics/category-distribution/
    Returns product count per category for the pie chart.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = (
            Product.objects.filter(vendor=request.user)
            .values("category__name")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        result = [
            {"category": row["category__name"] or "Uncategorised", "count": row["count"]}
            for row in data
        ]
        return success_response(data=result)
