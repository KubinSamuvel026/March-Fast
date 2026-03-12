from django.urls import path
from .views import (
    DashboardStatsView,
    SalesPerDayView,
    WeeklySalesView,
    CategoryDistributionView,
)

urlpatterns = [
    path("dashboard/",              DashboardStatsView.as_view(),        name="dashboard-stats"),
    path("sales-per-day/",          SalesPerDayView.as_view(),           name="sales-per-day"),
    path("weekly-sales/",           WeeklySalesView.as_view(),           name="weekly-sales"),
    path("category-distribution/",  CategoryDistributionView.as_view(),  name="category-distribution"),
]
