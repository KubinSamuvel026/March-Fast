"""
Order views — vendor-scoped list, recent orders, and status update.
"""
from rest_framework import generics, permissions, filters, status
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from Marchfast.utils import success_response, error_response
from .models import Order
from .serializers import OrderSerializer, OrderStatusSerializer, OrderCreateSerializer


class OrderListView(generics.ListCreateAPIView):
    """
    GET  /api/orders/ — paginated list of vendor's orders
    POST /api/orders/ — create order (used by customer checkout)
    """
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ["status"]
    search_fields      = ["customer_name", "order_id", "product__name"]
    ordering_fields    = ["created_at", "amount"]

    def get_permissions(self):
        # Allow unauthenticated users to create orders (checkout flow), but require auth for listing.
        if self.request.method == "POST":
            return [AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Order.objects.filter(vendor=self.request.user).select_related("product")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return OrderCreateSerializer
        return OrderSerializer

    def list(self, request, *args, **kwargs):
        queryset   = self.filter_queryset(self.get_queryset())
        page       = self.paginate_queryset(queryset)
        if page is not None:
            serializer = OrderSerializer(page, many=True)
            paginated_data = {
                "orders": serializer.data,
                "total": self.paginator.page.paginator.count,
                "next": self.paginator.get_next_link(),
                "previous": self.paginator.get_previous_link(),
            }
            return self.get_paginated_response(paginated_data)

        serializer = OrderSerializer(queryset, many=True)
        return success_response(data={"orders": serializer.data, "total": len(serializer.data)})

    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            order = serializer.save()
            return success_response(
                data=OrderSerializer(order).data,
                message="Order created.",
                status_code=status.HTTP_201_CREATED,
            )
        return error_response(errors=serializer.errors)


class RecentOrdersView(generics.ListAPIView):
    """GET /api/orders/recent/ — last 10 orders for the dashboard widget."""
    serializer_class   = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(vendor=self.request.user).select_related("product")[:10]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        # Debug: ensure vendor and returned count are visible in server logs
        print("RecentOrdersView: vendor=", request.user, "count=", len(serializer.data))

        vendor_info = {
            "id": request.user.id,
            "email": getattr(request.user, "email", None),
            "username": getattr(request.user, "username", None),
        }

        return success_response(data={
            "vendor": vendor_info,
            "orders": serializer.data,
            "total": len(serializer.data),
        })


class OrderStatusUpdateView(generics.UpdateAPIView):
    """PATCH /api/orders/<id>/status/ — change order status."""
    serializer_class   = OrderStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names  = ["patch"]

    def get_queryset(self):
        return Order.objects.filter(vendor=self.request.user)

    def update(self, request, *args, **kwargs):
        instance   = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return success_response(data=serializer.data, message="Order status updated.")
        return error_response(errors=serializer.errors)
