// src/hooks/useAnalytics.js

import { useState, useEffect, useCallback } from "react";
import { getDashboardStats } from "../api/analyticsAPI";
import { extractErrorMessage } from "../utils/apiResponseHandler";

// Default shape matches the Django response so the UI doesn't need null checks
const DEFAULT_STATS = {
  total_revenue:           0,
  total_orders:            0,
  active_products:         0,
  avg_rating:              0,
  revenue_change:          0,
  weekly_sales:           [],
  weekly_chart:            [],
  category_distribution:   {},
  order_status_breakdown:  {},
  low_stock_products:      [],
};

export function useAnalytics() {
  const [stats,   setStats]   = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { stats, loading, error, refetch };
}
