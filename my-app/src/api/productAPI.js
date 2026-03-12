// src/api/productAPI.js
// CRUD + search for vendor products.
// Image uploads use FormData (multipart/form-data).

import axiosClient from "./axiosClient";
import { ENDPOINTS } from "../config/apiConfig";
import { unwrapResponse } from "../utils/apiResponseHandler";

/**
 * Fetch all products for the current vendor.
 * Optional filters: { status, category, search }
 */
export async function getProducts(filters = {}) {
  const params = {};
  if (filters.status)   params.status   = filters.status;
  if (filters.category) params.category = filters.category;
  if (filters.search)   params.search   = filters.search;

  const response = await axiosClient.get(ENDPOINTS.PRODUCTS, { params });
  return unwrapResponse(response); // { products: [], total: N }
}

/**
 * Create a new product.
 * If `data.image` is a File object, sends as multipart form; otherwise JSON.
 */
export async function createProduct(data) {
  const payload = buildProductPayload(data);
  const config  = data.image instanceof File
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : {};

  const response = await axiosClient.post(ENDPOINTS.PRODUCTS, payload, config);
  return unwrapResponse(response);
}

/**
 * Update an existing product (partial update supported).
 */
export async function updateProduct(id, data) {
  const payload = buildProductPayload(data);
  const config  = data.image instanceof File
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : {};

  const response = await axiosClient.put(ENDPOINTS.PRODUCT_DETAIL(id), payload, config);
  return unwrapResponse(response);
}

/**
 * Delete a product by ID.
 */
export async function deleteProduct(id) {
  const response = await axiosClient.delete(ENDPOINTS.PRODUCT_DETAIL(id));
  return unwrapResponse(response);
}

/**
 * Full-text search across product names, descriptions, categories.
 */
export async function searchProducts(query) {
  const response = await axiosClient.get(ENDPOINTS.PRODUCT_SEARCH, {
    params: { q: query },
  });
  return unwrapResponse(response); // { products: [], total: N, query }
}

/**
 * Fetch available categories.
 */
export async function getCategories() {
  const response = await axiosClient.get(ENDPOINTS.CATEGORIES);
  return unwrapResponse(response);
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Build either a FormData (when image is a File) or plain object.
 * The backend accepts both.
 */
function buildProductPayload(data) {
  if (data.image instanceof File) {
    const form = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, value);
      }
    });
    return form;
  }
  return data;
}
