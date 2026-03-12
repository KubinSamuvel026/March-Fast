// src/components/OrderTable.jsx

import React from "react";

const STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const statusLabels = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusStyle = (s) => {
  const mapping = {
    pending:    { bg: "#FFFBEB", color: "#D97706" },
    processing: { bg: "#EEF2FF", color: "#4F46E5" },
    shipped:    { bg: "#F0F9FF", color: "#0284C7" },
    delivered:  { bg: "#ECFDF5", color: "#059669" },
    cancelled:  { bg: "#FFF1F2", color: "#E11D48" },
  };
  return mapping[s] || { bg: "#F3F4F6", color: "#6B7280" };
};

export default function OrderTable({
  orders,
  loading,
  error,
  total,
  page,
  pageSize,
  search,
  status,
  onSearch,
  onStatusFilter,
  onPageChange,
  onStatusChange,
  updatingOrderId,
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));

  return (
    <div style={{ padding: 20, background: "#FFF", borderRadius: 14, boxShadow: "0 8px 28px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Orders</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search by customer or order ID"
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #E5E7EB", minWidth: 260 }}
            />
            <select
              value={status}
              onChange={(e) => onStatusFilter(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #E5E7EB", minWidth: 160 }}
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ color: "#6B7280", fontSize: 14 }}>
          Showing {orders.length} of {total} orders
        </div>
      </div>

      {error ? (
        <div style={{ padding: 14, background: "#FFFBEB", border: "1px solid #FEE2E2", borderRadius: 10, color: "#B91C1C" }}>
          {error}
        </div>
      ) : null}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", color: "#1F2937" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #E5E7EB" }}>
              <th style={{ padding: "12px 10px" }}>Order ID</th>
              <th style={{ padding: "12px 10px" }}>Customer</th>
              <th style={{ padding: "12px 10px" }}>Product</th>
              <th style={{ padding: "12px 10px" }}>Qty</th>
              <th style={{ padding: "12px 10px" }}>Amount</th>
              <th style={{ padding: "12px 10px" }}>Order Date</th>
              <th style={{ padding: "12px 10px" }}>Status</th>
              <th style={{ padding: "12px 10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: 30, textAlign: "center", color: "#6B7280" }}>
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 30, textAlign: "center", color: "#6B7280" }}>
                  No orders match these filters.
                </td>
              </tr>
            ) : (
              orders.map((order, idx) => {
                const statusStyles = statusStyle(order.status);
                const isUpdating = updatingOrderId === order.id;
                return (
                  <tr
                    key={order.id}
                    className="trow"
                    style={{
                      borderBottom: "1px solid #F3F4F6",
                      background: idx % 2 === 0 ? "white" : "#F9FAFB",
                    }}
                  >
                    <td style={{ padding: "12px 10px", fontWeight: 600 }}>{order.order_id || order.id}</td>
                    <td style={{ padding: "12px 10px" }}>{order.customer_name}</td>
                    <td style={{ padding: "12px 10px" }}>{order.product_name}</td>
                    <td style={{ padding: "12px 10px" }}>{order.quantity ?? 1}</td>
                    <td style={{ padding: "12px 10px" }}>
                      ₹{(Number(order.amount) || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <span style={{
                        display: "inline-flex",
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: statusStyles.bg,
                        color: statusStyles.color,
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <select
                        value={order.status}
                        onChange={(e) => onStatusChange(order.id, e.target.value)}
                        disabled={isUpdating}
                        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #E5E7EB", minWidth: 140 }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{statusLabels[s]}</option>
                        ))}
                      </select>
                      {isUpdating ? (
                        <span style={{ marginLeft: 10, fontSize: 12, color: "#6B7280" }}>Updating...</span>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <div style={{ fontSize: 13, color: "#6B7280" }}>
          Page {page} of {totalPages}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              background: "white",
              cursor: page <= 1 || loading ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || loading}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              background: "white",
              cursor: page >= totalPages || loading ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
