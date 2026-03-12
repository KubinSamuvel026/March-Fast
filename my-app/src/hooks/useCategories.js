// src/hooks/useCategories.js
// Fetch and cache categories for dropdowns.

import { useState, useEffect } from "react";
import { getCategories } from "../api/categoryAPI";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCategories();
        if (!active) return;
        setCategories(Array.isArray(data) ? data : data?.categories ?? []);
      } catch (err) {
        if (!active) return;
        setError(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return {
    categories,
    loading,
    error,
  };
}
