// src/hooks/useOrders.js

import { useState, useEffect, useCallback } from "react";
import { getOrders, getRecentOrders, updateOrderStatus } from "../api/orderAPI";
import { extractErrorMessage } from "../utils/apiResponseHandler";

export function useOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [total, setTotal]     = useState(0);
  const [next, setNext]       = useState(null);
  const [previous, setPrevious] = useState(null);

  const refetch = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getOrders(filters);
      setOrders(data.orders || []);
      setTotal(data.total ?? data.count ?? 0);
      setNext(data.next || null);
      setPrevious(data.previous || null);
      return data;
    } catch (err) {
      setError(extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const changeStatus = useCallback(async (id, newStatus) => {
    try {
      const updated = await updateOrderStatus(id, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: updated.status } : o))
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: extractErrorMessage(err) };
    }
  }, []);

  return { orders, loading, error, total, next, previous, refetch, changeStatus };
}

export function useRecentOrders() {
  const [orders,  setOrders]  = useState([]);
  const [vendor,  setVendor]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getRecentOrders();
        const ordersArray = Array.isArray(data) ? data : data?.orders || [];

        if (!cancelled) {
          setOrders(ordersArray);
          setVendor(data?.vendor || null);
        }
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { orders, vendor, loading, error };
}
