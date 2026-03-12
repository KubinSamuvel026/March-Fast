// src/utils/apiResponseHandler.js
// Normalizes backend responses and extracts error messages.

/**
 * Unwrap the backend's standard envelope: { success, data, message }
 * Returns the `data` payload directly so callers don't have to destructure.
 */
export function unwrapResponse(response) {
  // Support our custom { success, data } envelope and DRF paginated responses.
  // DRF paginated responses use { count, next, previous, results }.
  return response.data?.data ?? response.data?.results ?? response.data;
}

/**
 * Extract a human-readable error message from an Axios error.
 * Priority: backend `message` field → validation errors → network error.
 */
export function extractErrorMessage(error) {
  if (!error.response) {
    return "Network error — please check your connection.";
  }

  const { data, status } = error.response;

  // Debug: log backend error payload so issues can be diagnosed quickly
  // (Can be removed in production if desired.)
  console.log("API error response:", data);

  if (status === 401) return "Session expired. Please log in again.";
  if (status === 403) return "You don't have permission to perform this action.";
  if (status === 404) return "The requested resource was not found.";
  if (status === 500) return "Server error — please try again later.";

  // Backend validation errors come as { errors: { field: ["msg", ...] } }
  const errorPayload = data?.errors || data?.data;
  if (errorPayload && typeof errorPayload === "object") {
    const firstKey = Object.keys(errorPayload)[0];
    if (firstKey) {
      const msgs = errorPayload[firstKey];
      return `${firstKey}: ${Array.isArray(msgs) ? msgs[0] : msgs}`;
    }
  }

  return data?.message || "An unexpected error occurred.";
}

/**
 * Returns true when the backend reported success.
 */
export function isSuccess(response) {
  return response.data?.success === true;
}
