// src/pages/AnalyticsPage.jsx

import { useEffect } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { WeeklySalesChart, CategoryDistributionChart } from "../components/AnalyticsCharts";

export default function AnalyticsPage({ showToast }) {
  const { stats, loading, error } = useAnalytics();

  useEffect(() => {
    if (error) {
      showToast?.(error, "error");
    }
  }, [error, showToast]);

  return (
    <div style={{ padding: 20, minHeight: "100vh" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 18 }}>
        <div style={{ flex: "1 1 220px", background: "#FFF", borderRadius: 14, padding: 18, boxShadow: "0 8px 22px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>Total Revenue</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>₹{(stats.total_revenue || 0).toLocaleString()}</div>
        </div>
        <div style={{ flex: "1 1 220px", background: "#FFF", borderRadius: 14, padding: 18, boxShadow: "0 8px 22px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>Total Orders</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.total_orders}</div>
        </div>
        <div style={{ flex: "1 1 220px", background: "#FFF", borderRadius: 14, padding: 18, boxShadow: "0 8px 22px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>Active Products</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.active_products}</div>
        </div>
        <div style={{ flex: "1 1 220px", background: "#FFF", borderRadius: 14, padding: 18, boxShadow: "0 8px 22px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>Average Rating</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.avg_rating?.toFixed?.(1) ?? stats.avg_rating}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 18 }}>
        <WeeklySalesChart weeklySales={stats.weekly_sales || []} />
        <CategoryDistributionChart distribution={stats.category_distribution || {}} />
      </div>

      {loading ? (
        <div style={{ marginTop: 24, color: "#6B7280" }}>Loading analytics…</div>
      ) : null}

      {error ? (
        <div style={{ marginTop: 24, padding: 14, background: "#FFFBEB", border: "1px solid #FEE2E2", borderRadius: 10, color: "#B91C1C" }}>
          {error}
        </div>
      ) : null}
    </div>
  );
}
