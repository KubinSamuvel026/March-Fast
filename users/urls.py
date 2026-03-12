from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    VendorRegisterView,
    MarchFastTokenView,
    VendorProfileView,
    VendorPasswordChangeView,
)

urlpatterns = [
    path("register/", VendorRegisterView.as_view(),        name="vendor-register"),
    path("login/",    MarchFastTokenView.as_view(),        name="vendor-login"),
    path("refresh/",  TokenRefreshView.as_view(),          name="token-refresh"),
    path("profile/",  VendorProfileView.as_view(),         name="vendor-profile"),
    path("password/", VendorPasswordChangeView.as_view(),  name="vendor-password"),
]
