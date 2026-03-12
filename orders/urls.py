from django.urls import path
from .views import OrderListView, RecentOrdersView, OrderStatusUpdateView

urlpatterns = [
    path("",                    OrderListView.as_view(),         name="order-list"),
    path("recent/",             RecentOrdersView.as_view(),      name="order-recent"),
    path("<int:pk>/status/",    OrderStatusUpdateView.as_view(), name="order-status"),
]
