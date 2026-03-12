"""
Product CRUD views — vendors can only see & manage their own products.
"""
from rest_framework import generics, permissions, filters, status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from Marchfast.utils import success_response, error_response
from .models import Product, Category
from .serializers import ProductSerializer, ProductCreateSerializer, CategorySerializer


class IsVendorOwner(permissions.BasePermission):
    """Object-level permission — only the owning vendor may edit."""
    def has_object_permission(self, request, view, obj):
        return obj.vendor == request.user


class ProductListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/products/       — list products (public for browsing)
    POST /api/products/       — create a product for the authenticated vendor
    """
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ["status", "category"]
    search_fields      = ["name", "description"]
    ordering_fields    = ["price", "stock", "created_at"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        # Public listing should show all products (for guest and logged-in visitors alike).
        # Vendor-specific views should use a dedicated endpoint or query param if needed.
        return Product.objects.all().select_related("category")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProductCreateSerializer
        return ProductSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page     = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ProductSerializer(page, many=True)
            paginated_data = {
                "products": serializer.data,
                "total": self.paginator.page.paginator.count,
                "next": self.paginator.get_next_link(),
                "previous": self.paginator.get_previous_link(),
            }
            return success_response(data=paginated_data)

        serializer = ProductSerializer(queryset, many=True)
        return success_response(data={
            "products": serializer.data,
            "total": len(serializer.data),
        })

    def create(self, request, *args, **kwargs):
        serializer = ProductCreateSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            product = serializer.save()
            return success_response(
                data=ProductSerializer(product).data,
                message="Product created successfully.",
                status_code=status.HTTP_201_CREATED,
            )

        # Debug: surface serializer validation errors in the server logs
        print("Product create validation errors:", serializer.errors)
        return error_response(errors=serializer.errors)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/products/<id>/  — retrieve
    PUT    /api/products/<id>/  — full update
    PATCH  /api/products/<id>/  — partial update
    DELETE /api/products/<id>/  — soft delete (or hard delete)
    """
    serializer_class = ProductCreateSerializer

    def get_permissions(self):
        # Allow anyone to view product details, but require auth + ownership for edits.
        if self.request.method == "GET":
            return [AllowAny()]
        return [permissions.IsAuthenticated(), IsVendorOwner()]

    def get_queryset(self):
        if self.request.method == "GET":
            return Product.objects.all().select_related("category")
        return Product.objects.filter(vendor=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance   = self.get_object()
        serializer = ProductSerializer(instance)
        return success_response(data=serializer.data)

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        instance   = self.get_object()
        serializer = ProductCreateSerializer(instance, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            product = serializer.save()
            return success_response(
                data=ProductSerializer(product).data,
                message="Product updated successfully.",
            )

        # Debug: surface serializer validation errors in the server logs
        print("Product update validation errors:", serializer.errors)
        return error_response(errors=serializer.errors)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return success_response(message="Product deleted successfully.", status_code=status.HTTP_204_NO_CONTENT)


class ProductSearchView(generics.ListAPIView):
    """GET /api/products/search/?q=<query> — full-text search within vendor's catalogue."""
    serializer_class   = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get("q", "")
        return Product.objects.filter(
            vendor=self.request.user,
            name__icontains=query,
        ).select_related("category")

    def list(self, request, *args, **kwargs):
        queryset   = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return success_response(data={
            "products": serializer.data,
            "total": len(serializer.data),
        })


class CategoryListView(generics.ListAPIView):
    """GET /api/products/categories/ — all available categories."""
    queryset           = Category.objects.all()
    serializer_class   = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return success_response(data=serializer.data)
