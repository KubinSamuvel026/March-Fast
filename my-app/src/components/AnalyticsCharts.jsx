// src/components/AnalyticsCharts.jsx

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#A855F7", "#14B8A6", "#F97316"];

export function WeeklySalesChart({ weeklySales = [] }) {
  const today = new Date();
  const data = weeklySales.map((value, idx) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (weeklySales.length - 1 - idx));
    const label = date.toLocaleDateString(undefined, { weekday: "short" });
    return { name: label, value };
  });

  return (
    <div style={{ width: "100%", height: 300, background: "#fff", borderRadius: 14, padding: 18, boxShadow: "0 8px 22px rgba(0,0,0,0.08)" }}>
      <h3 style={{ margin: 0, marginBottom: 12, fontSize: 18 }}>Weekly Sales</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} />
          <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
          <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
          <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryDistributionChart({ distribution = {} }) {
  const data = Object.entries(distribution).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ width: "100%", height: 300, background: "#fff", borderRadius: 14, padding: 18, boxShadow: "0 8px 22px rgba(0,0,0,0.08)" }}>
      <h3 style={{ margin: 0, marginBottom: 12, fontSize: 18 }}>Category Distribution</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label />
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
          ))}
          <Tooltip formatter={(value) => `${value}`} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
