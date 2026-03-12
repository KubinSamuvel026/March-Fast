// src/hooks/useProducts.js
// Custom hook: manages the full product lifecycle for the vendor dashboard.

import { useState, useEffect, useCallback } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} from "../api/productAPI";
import { extractErrorMessage } from "../utils/apiResponseHandler";

/**
 * useProducts
 *
 * State:
 *   products   - array of product objects
 *   loading    - true while any async op is in flight
 *   error      - string error message or null
 *   total      - total product count from backend
 *
 * Methods:
 *   refetch(filters?)  - reload products with optional filters
 *   addProduct(data)   - create & optimistically update list
 *   editProduct(id, d) - update & reflect change immediately
 *   removeProduct(id)  - delete & remove from list
 *   search(query)      - run search and replace products list
 */
export function useProducts(initialFilters = {}) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [total,    setTotal]    = useState(0);

  // ── Fetch / Refetch ─────────────────────────────────────────────────────────
  const refetch = useCallback(async (filters = initialFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts(filters);
      setProducts(data.products || []);
      setTotal(data.total   || 0);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { refetch(); }, [refetch]);

  // ── Create ──────────────────────────────────────────────────────────────────
  const addProduct = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const newProduct = await createProduct(formData);
      setProducts((prev) => [newProduct, ...prev]);
      setTotal((t) => t + 1);
      return { success: true, product: newProduct };
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Update ──────────────────────────────────────────────────────────────────
  const editProduct = useCallback(async (id, formData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateProduct(id, formData);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      );
      return { success: true, product: updated };
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const removeProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    // Optimistic removal
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setTotal((t) => t - 1);
    try {
      await deleteProduct(id);
      return { success: true };
    } catch (err) {
      // Roll back on failure
      await refetch();
      const msg = extractErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  // ── Search ──────────────────────────────────────────────────────────────────
  const search = useCallback(async (query) => {
    if (!query.trim()) {
      return refetch();
    }
    setLoading(true);
    setError(null);
    try {
      const data = await searchProducts(query);
      setProducts(data.products || []);
      setTotal(data.total   || 0);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  return {
    products,
    loading,
    error,
    total,
    refetch,
    addProduct,
    editProduct,
    removeProduct,
    search,
  };
}
