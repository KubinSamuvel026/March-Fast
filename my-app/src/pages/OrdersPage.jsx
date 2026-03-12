// src/pages/OrdersPage.jsx

import { useEffect, useMemo, useState } from "react";
import { useOrders } from "../hooks/useOrders";
import OrderTable from "../components/OrderTable";

const PAGE_SIZE = 10;

export default function OrdersPage({ showToast }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const { orders, loading, error, total, refetch, changeStatus } = useOrders();

  useEffect(() => {
    refetch({ search, status, page, pageSize: PAGE_SIZE }).catch(() => {});
  }, [search, status, page, refetch]);

  const handleSearch = (value) => {
    setPage(1);
    setSearch(value);
  };

  const handleStatusFilter = (value) => {
    setPage(1);
    setStatus(value);
  };

  const onStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    const result = await changeStatus(orderId, newStatus);
    setUpdatingOrderId(null);

    if (!result.success) {
      showToast?.(result.error || "Unable to update order status.", "error");
    } else {
      showToast?.("Order status updated.", "success");
    }
  };

  const pageCount = useMemo(() => Math.max(1, Math.ceil((total || 0) / PAGE_SIZE)), [total]);

  return (
    <div style={{ padding: 20, minHeight: "100vh" }}>
      <OrderTable
        orders={orders}
        loading={loading}
        error={error}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        search={search}
        status={status}
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
        onPageChange={(next) => setPage(next)}
        onStatusChange={onStatusChange}
        updatingOrderId={updatingOrderId}
      />
      {error ? (
        <div style={{ marginTop: 14, color: "#B91C1C" }}>
          {error}
        </div>
      ) : null}
      {loading ? null : total === 0 ? (
        <div style={{ marginTop: 20, color: "#6B7280" }}>
          No orders to display. Make sure you have orders created in the system.
        </div>
      ) : null}
      <div style={{ marginTop: 14, fontSize: 12, color: "#6B7280" }}>
        Page {page} of {pageCount}
      </div>
    </div>
  );
}
