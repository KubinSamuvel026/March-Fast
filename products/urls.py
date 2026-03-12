from django.urls import path
from .views import ProductListCreateView, ProductDetailView, ProductSearchView, CategoryListView

urlpatterns = [
    path("",              ProductListCreateView.as_view(), name="product-list-create"),
    path("<int:pk>/",     ProductDetailView.as_view(),     name="product-detail"),
    path("search/",       ProductSearchView.as_view(),     name="product-search"),
    path("categories/",   CategoryListView.as_view(),      name="category-list"),
]
