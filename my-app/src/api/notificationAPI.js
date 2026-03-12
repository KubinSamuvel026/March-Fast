// src/api/notificationAPI.js

import axiosClient from "./axiosClient";
import { ENDPOINTS } from "../config/apiConfig";
import { unwrapResponse } from "../utils/apiResponseHandler";

/**
 * Fetch all notifications for current vendor.
 * Returns: { notifications: [], unread_count: N }
 */
export async function getNotifications() {
  const response = await axiosClient.get(ENDPOINTS.NOTIFICATIONS);
  return unwrapResponse(response);
}

/** Mark a single notification as read. */
export async function markNotificationRead(id) {
  const response = await axiosClient.patch(ENDPOINTS.NOTIFICATION_READ(id));
  return unwrapResponse(response);
}

/** Mark ALL notifications as read. */
export async function markAllNotificationsRead() {
  const response = await axiosClient.patch(ENDPOINTS.NOTIFICATIONS_READ_ALL);
  return unwrapResponse(response);
}
