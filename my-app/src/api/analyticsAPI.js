// src/api/analyticsAPI.js

import axiosClient from "./axiosClient";
import { ENDPOINTS } from "../config/apiConfig";
import { unwrapResponse } from "../utils/apiResponseHandler";

/**
 * Fetch all dashboard KPIs and chart data in a single call.
 * Returns: { total_revenue, total_orders, active_products, avg_rating,
 *            revenue_change, weekly_chart, category_distribution,
 *            order_status_breakdown, low_stock_products }
 */
export async function getDashboardStats() {
  const response = await axiosClient.get(ENDPOINTS.DASHBOARD_STATS);
  return unwrapResponse(response);
}

/**
 * Fetch day-by-day sales breakdown for the last 30 days.
 */
export async function getSalesOverview() {
  const response = await axiosClient.get(ENDPOINTS.SALES_OVERVIEW);
  return unwrapResponse(response);
}
