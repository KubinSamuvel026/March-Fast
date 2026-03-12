// src/api/orderAPI.js

import axiosClient from "./axiosClient";
import { ENDPOINTS } from "../config/apiConfig";
import { unwrapResponse } from "../utils/apiResponseHandler";

/**
 * Fetch all orders. Optional filter: { status, search }
 */
export async function getOrders(filters = {}) {
  const params = {};
  if (filters.status) params.status = filters.status;
  if (filters.search) params.search = filters.search;
  if (filters.page) params.page = filters.page;
  if (filters.pageSize) params.page_size = filters.pageSize;

  const response = await axiosClient.get(ENDPOINTS.ORDERS, { params });
  return unwrapResponse(response); // { orders: [], total: N, next, previous }
}

/**
 * Fetch the 5 most recent orders for the dashboard widget.
 */
export async function getRecentOrders() {
  const response = await axiosClient.get(ENDPOINTS.ORDERS_RECENT);

  const data = unwrapResponse(response); // { orders: [] }
  return data;
}

/**
 * Update the status of a single order.
 * @param {number} id     - Order primary key
 * @param {string} status - One of: pending, processing, shipped, delivered, cancelled
 */
export async function updateOrderStatus(id, status) {
  const response = await axiosClient.patch(ENDPOINTS.ORDER_STATUS_UPDATE(id), { status });
  return unwrapResponse(response);
}
