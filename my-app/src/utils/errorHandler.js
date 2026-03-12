// src/utils/errorHandler.js
// Helper utilities for displaying consistent error messages across the app.

import { extractErrorMessage } from "./apiResponseHandler";

/**
 * Normalize an error object (Axios or otherwise) into a single string.
 */
export function getErrorMessage(error) {
  if (!error) return "An unexpected error occurred.";
  return extractErrorMessage(error);
}
