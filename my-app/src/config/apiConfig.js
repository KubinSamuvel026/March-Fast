// src/config/apiConfig.js
// Central place for all API configuration.
// Override via .env: VITE_API_URL=https://your-server.com/api

export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://marchfastn.shop";
export const BASE_URL = API_BASE_URL;

export const API_TIMEOUT = 15000; // 15 seconds

export const ENDPOINTS = {
  // Auth
  LOGIN:           "/auth/login/",
  REGISTER:        "/auth/register/",
  LOGOUT:          "/auth/logout/",
  TOKEN_REFRESH:   "/auth/token/refresh/",
  PROFILE:         "/auth/profile/",
  CHANGE_PASSWORD: "/auth/change-password/",

  // Products
  PRODUCTS:         "/products/",
  PRODUCT_DETAIL:   (id) => `/products/${id}/`,
  PRODUCT_SEARCH:   "/products/search/",
  CATEGORIES:       "/products/categories/",

  // Orders
  ORDERS:              "/orders/",
  ORDERS_RECENT:       "/orders/recent/",
  ORDER_STATUS_UPDATE: (id) => `/orders/${id}/status/`,

  // Analytics
  DASHBOARD_STATS: "/analytics/dashboard/",
  SALES_OVERVIEW:  "/analytics/sales/",

  // Notifications
  NOTIFICATIONS:      "/notifications/",
  NOTIFICATION_READ:  (id) => `/notifications/${id}/read/`,
  NOTIFICATIONS_READ_ALL: "/notifications/read-all/",
};
