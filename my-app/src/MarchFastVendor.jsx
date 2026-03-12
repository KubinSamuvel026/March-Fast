// src/MarchFastVendor.jsx
// Full MarchFast Vendor Dashboard — connected to Django REST backend.
// Mock data replaced with: useProducts, useRecentOrders, useAnalytics hooks.

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProducts } from "./hooks/useProducts";
import { useRecentOrders } from "./hooks/useOrders";
import { useAnalytics } from "./hooks/useAnalytics";
import { useCategories } from "./hooks/useCategories";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "./api/notificationAPI";
import OrdersPage from "./pages/OrdersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import { useAuth } from "./context/AuthContext";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary: "#FF6B35", blue: "#3B82F6", green: "#10B981",
  rose: "#F43F5E", purple: "#A855F7", text: "#1E1B2E",
  muted: "#6B7280", border: "#E8E4F0", bg: "#F8F7FF", card: "#FFFFFF",
};

const navLinks = [
  { label: "Dashboard", icon: "⊞", id: "dashboard" },
  { label: "Products", icon: "🏷️", id: "products" },
  { label: "Orders", icon: "📦", id: "orders" },
  { label: "Analytics", icon: "📊", id: "analytics" },
  { label: "Customers", icon: "👥", id: "customers" },
  { label: "Settings", icon: "⚙️", id: "settings" },
];

const statusStyle = (s) => ({
  active: { bg: "#ECFDF5", color: "#059669", label: "Active" },
  low: { bg: "#FFFBEB", color: "#D97706", label: "Low Stock" },
  out: { bg: "#FFF1F2", color: "#E11D48", label: "Out of Stock" },
  delivered: { bg: "#ECFDF5", color: "#059669", label: "Delivered" },
  processing: { bg: "#EEF2FF", color: "#4F46E5", label: "Processing" },
  shipped: { bg: "#F0F9FF", color: "#0284C7", label: "Shipped" },
  pending: { bg: "#FFFBEB", color: "#D97706", label: "Pending" },
  cancelled: { bg: "#FFF1F2", color: "#E11D48", label: "Cancelled" },
}[s] || { bg: "#F3F4F6", color: "#6B7280", label: s });

// ─── Reusable components ──────────────────────────────────────────────────────
function Spinner({ size = 20, color = C.primary }) {
  return (
    <div style={{
      width: size, height: size, border: `3px solid ${color}30`,
      borderTop: `3px solid ${color}`, borderRadius: "50%",
      animation: "spin 0.8s linear infinite", display: "inline-block",
    }} />
  );
}

function Toast({ message, type = "error", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg = type === "error" ? "#FFF1F2" : "#ECFDF5";
  const color = type === "error" ? C.rose : C.green;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 999,
      background: bg, border: `1.5px solid ${color}40`, borderRadius: 12,
      padding: "12px 18px", display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxWidth: 340,
      animation: "slideIn 0.3s ease",
    }}>
      <span style={{ fontSize: 18 }}>{type === "error" ? "⚠️" : "✅"}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color, marginLeft: "auto" }}>✕</button>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function MarchFastVendor() {
  const { user: vendor } = useAuth();

  // ── Data hooks ──────────────────────────────────────────────────────────────
  const {
    products, loading: pLoading, error: pError, total: pTotal,
    addProduct, editProduct, removeProduct, search,
  } = useProducts();

  const { categories, loading: categoriesLoading } = useCategories();

  const { orders: recentOrders, vendor: recentVendor, loading: oLoading } = useRecentOrders();
  const { stats, loading: aLoading, error: aError } = useAnalytics();

  // ── Notifications (managed locally, not via hook for simplicity) ────────────
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getNotifications()
      .then((d) => {
        setNotifications(d.notifications || []);
        setUnreadCount(d.unread_count || 0);
      })
      .catch(() => { });
  }, []);

  // ── Routing & UI state ─────────────────────────────────────────────────────
  const location = useLocation();
  const navigate = useNavigate();

  const activeNav = location.pathname.startsWith("/orders")
    ? "orders"
    : location.pathname.startsWith("/analytics")
      ? "analytics"
      : "dashboard";

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);   // product being edited
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);   // { message, type }
  const [saving, setSaving] = useState(false);  // modal submit in-flight
  const [form, setForm] = useState({ name: "", price: "", stock: "", category: "", description: "", image: null });
  const [previewUrl, setPreviewUrl] = useState(null);

  const searchTimer = useRef(null);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type });
  }, []);

  // ── Search (debounced 400 ms) ────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      search(searchQuery);
    }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery, search]);

  // ── Notification handlers ────────────────────────────────────────────────────
  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((n) => n.map((x) => x.id === id ? { ...x, is_read: true } : x));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((n) => n.map((x) => ({ ...x, is_read: true })));
    setUnreadCount(0);
  };

  // ── Product modal ─────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditTarget(null);
    setForm({ name: "", price: "", stock: "", category: "", description: "", image: null });
    setPreviewUrl(null);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditTarget(product);
    setForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category || "",
      description: product.description || "",
      image: null,
    });
    setPreviewUrl(product.image_url || null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      showToast("Name and Price are required.");
      return;
    }

    if (form.image && form.image.size > 2 * 1024 * 1024) {
      showToast("Image size must be less than 2MB.");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10) || 0,
      category: form.category || undefined,
      description: form.description,
      ...(form.image && { image: form.image })
    };

    const result = editTarget
      ? await editProduct(editTarget.id, payload)
      : await addProduct(payload);

    setSaving(false);
    if (result.success) {
      setShowModal(false);
      showToast(editTarget ? "Product updated!" : "Product added!", "success");
    } else {
      showToast(result.error || "Something went wrong.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    const result = await removeProduct(id);
    if (!result.success) showToast(result.error);
    else showToast("Product deleted.", "success");
  };

  // ── Logout ────────────────────────────────────────────────────────────────────
  const { logout } = useAuth();
  const handleLogout = async () => {
    await logout();
  };

  // ── Derived analytics stats cards ────────────────────────────────────────────
  const statCards = [
    {
      label: "Total Revenue", value: `₹${(stats.total_revenue || 0).toLocaleString("en-IN")}`,
      change: `${stats.revenue_change >= 0 ? "+" : ""}${stats.revenue_change}%`,
      up: stats.revenue_change >= 0,
      icon: "💰", color: C.primary, bg: "#FFF3EE",
    },
    {
      label: "Total Orders", value: stats.total_orders,
      change: "+8.2%", up: true, icon: "📦", color: C.blue, bg: "#EEF2FF",
    },
    {
      label: "Active Products", value: stats.active_products,
      change: "+2", up: true, icon: "🏷️", color: C.green, bg: "#ECFDF5",
    },
    {
      label: "Avg. Rating", value: `${stats.avg_rating}★`,
      change: "+0.3", up: true, icon: "⭐", color: C.purple, bg: "#FAF5FF",
    },
  ];

  const weeklyData = stats.weekly_sales?.length
    ? stats.weekly_sales
    : [20, 45, 30, 70, 40, 80, 55];

  const maxWeekly = Math.max(...weeklyData, 1);

  const weeklyLabels = Array.from({ length: weeklyData.length }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (weeklyData.length - 1 - idx));
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  });

  const categoryData = Object.entries(stats.category_distribution || {}).map(([name, value]) => ({
    name,
    value,
  }));
  const totalCategory = categoryData.reduce((sum, item) => sum + (item.value || 0), 0);
  const categoryWithPct = categoryData.map((item) => ({
    ...item,
    percentage: totalCategory ? Math.round((item.value / totalCategory) * 100) : 0,
  }));

  return (
    <div style={{ fontFamily: "'Outfit','Nunito',sans-serif", background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-thumb{background:#C4B5FD;border-radius:10px}
        .nav-link{transition:all 0.2s;cursor:pointer}
        .nav-link:hover{background:#F3F0FF!important;color:${C.primary}!important}
        .nav-link.active{background:linear-gradient(135deg,#FF6B35,#FF8C61)!important;color:white!important;box-shadow:0 4px 15px rgba(255,107,53,.35)}
        .card{transition:transform .2s,box-shadow .2s}
        .card:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,.10)!important}
        .btn-p{background:linear-gradient(135deg,#FF6B35,#FF8C61);color:white;border:none;cursor:pointer;transition:all .2s;font-family:Outfit,sans-serif}
        .btn-p:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(255,107,53,.4)}
        .btn-p:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .btn-e{background:#EEF2FF;color:#4F46E5;border:1.5px solid #C7D2FE;cursor:pointer;transition:all .2s;font-family:Outfit,sans-serif}
        .btn-e:hover{background:#4F46E5;color:white}
        .btn-d{background:#FFF1F2;color:#E11D48;border:1.5px solid #FECDD3;cursor:pointer;transition:all .2s;font-family:Outfit,sans-serif}
        .btn-d:hover{background:#E11D48;color:white}
        .trow:hover{background:#FAFAFE!important}
        .stat-card{transition:all .25s}
        .stat-card:hover{transform:translateY(-4px) scale(1.02)}
        .logo-text{background:linear-gradient(135deg,#FF6B35,#A855F7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        input:focus,select:focus{outline:none;border-color:${C.primary}!important;box-shadow:0 0 0 3px rgba(255,107,53,.15)!important}
        .tag{border-radius:20px;font-size:11px;font-weight:600;padding:3px 10px;display:inline-block}
        .notif-dot{width:8px;height:8px;background:#FF6B35;border-radius:50%;position:absolute;top:2px;right:2px}
        .pulse{animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
      `}</style>

      {/* TOAST */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <header style={{
        background: "white", borderBottom: `2px solid ${C.border}`,
        padding: "0 24px", height: 64, display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 2px 16px rgba(0,0,0,.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.muted }}>☰</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#FF6B35,#A855F7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 16 }}>M</div>
            <span className="logo-text" style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>MarchFast</span>
            <span style={{ background: "#FFF3EE", color: C.primary, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, border: `1px solid #FFDDD0` }}>VENDOR</span>
          </div>
        </div>

        <div style={{ flex: 1, maxWidth: 400, margin: "0 32px" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted }}>🔍</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              style={{ width: "100%", padding: "9px 12px 9px 38px", border: `1.5px solid ${C.border}`, borderRadius: 12, background: C.bg, fontSize: 13.5, color: C.text, fontFamily: "Outfit,sans-serif" }}
            />
            {pLoading && searchQuery && (
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
                <Spinner size={16} />
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn-p" onClick={openAddModal} style={{ padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            ＋ Add Product
          </button>

          {/* Notifications bell */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setNotifOpen(!notifOpen)} style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10, width: 38, height: 38, cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>🔔</button>
            {unreadCount > 0 && <span className="notif-dot pulse" />}
          </div>

          {/* Vendor avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "6px 12px 6px 6px", cursor: "pointer" }}>
            <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#FF6B35,#A855F7)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13 }}>
              {(vendor?.store_name || "V")[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{vendor?.store_name || "Vendor"}</div>
              <div style={{ fontSize: 11, color: C.muted }}>Vendor</div>
            </div>
            <button onClick={handleLogout} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 11, marginLeft: 4 }}>Logout</button>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1 }}>
        {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
        <aside style={{ width: sidebarOpen ? 220 : 0, background: "white", borderRight: `2px solid ${C.border}`, overflow: "hidden", transition: "width .3s", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 12px 12px", flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "1px", textTransform: "uppercase", padding: "0 8px 10px" }}>MAIN MENU</div>
            {navLinks.map((link) => (
              <button key={link.id} className={`nav-link ${activeNav === link.id ? "active" : ""}`}
                onClick={() => {
                  if (link.id === "orders") navigate("/orders");
                  else if (link.id === "analytics") navigate("/analytics");
                  else navigate("/dashboard");
                }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, border: "none", background: "none", textAlign: "left", fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 4, fontFamily: "Outfit,sans-serif", cursor: "pointer" }}>
                <span style={{ fontSize: 16 }}>{link.icon}</span> {link.label}
              </button>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: `1px solid ${C.border}` }}>
            <div style={{ background: "linear-gradient(135deg,#FFF3EE,#FAF5FF)", border: `1px solid #FFDDD0`, borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>⚡ Pro Seller</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Unlock advanced analytics & priority listing</div>
              <button className="btn-p" style={{ marginTop: 8, width: "100%", padding: 7, borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none" }}>Upgrade Now</button>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <main style={{ flex: 1, padding: 28, overflow: "auto" }}>
          {activeNav === "orders" ? (
            <OrdersPage showToast={showToast} />
          ) : activeNav === "analytics" ? (
            <AnalyticsPage showToast={showToast} />
          ) : (
            <>

              {/* Page header */}
              <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>
                    Welcome back, <span style={{ color: C.primary }}>{vendor?.store_name || "Vendor"}</span>! 🎉
                  </h1>
                  <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>Here's what's happening with your store today.</p>
                </div>
                <div style={{ background: "white", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "8px 16px", fontSize: 13, color: C.muted }}>
                  📅 {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>

              {/* Error banner */}
              {(aError || pError) && (
                <div style={{ background: "#FFF1F2", border: `1.5px solid #FECDD3`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, color: C.rose, fontSize: 13 }}>
                  ⚠️ {aError || pError}
                </div>
              )}

              {/* ── STATS GRID ─────────────────────────────────────────────────── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
                {statCards.map((s, i) => (
                  <div key={i} className="stat-card card" style={{ background: "white", borderRadius: 16, padding: 20, border: `1.5px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
                    {aLoading ? (
                      <div style={{ display: "flex", justifyContent: "center", padding: 20 }}><Spinner color={s.color} /></div>
                    ) : (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                          <div style={{ width: 44, height: 44, background: s.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
                          <span style={{ background: s.up ? "#ECFDF5" : "#FFF1F2", color: s.up ? "#059669" : "#E11D48", fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 20 }}>{s.change}</span>
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: C.text }}>{s.value}</div>
                        <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
                        <div style={{ height: 4, background: C.border, borderRadius: 4, marginTop: 14 }}>
                          <div style={{ height: "100%", width: `${60 + i * 10}%`, background: s.color, borderRadius: 4 }} />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* ── PRODUCTS + ORDERS GRID ──────────────────────────────────────── */}
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, marginBottom: 24 }}>

                {/* Products table */}
                <div className="card" style={{ background: "white", borderRadius: 18, border: `1.5px solid ${C.border}`, boxShadow: "0 2px 16px rgba(0,0,0,.05)", overflow: "hidden" }}>
                  <div style={{ padding: "18px 22px", borderBottom: `1.5px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text }}>📦 Your Inventory</h2>
                      <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                        {pLoading ? "Loading…" : `${pTotal} products listed`}
                      </p>
                    </div>
                    <button className="btn-p" onClick={openAddModal} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none" }}>＋ Add New</button>
                  </div>

                  {pLoading && products.length === 0 ? (
                    <div style={{ padding: 40, display: "flex", justifyContent: "center" }}><Spinner size={32} /></div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: C.bg }}>
                            {["Image", "Product Name", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                              <th key={h} style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: C.muted, textAlign: "left", letterSpacing: "0.5px", textTransform: "uppercase", borderBottom: `1.5px solid ${C.border}` }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {products.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 14 }}>
                                {searchQuery ? `No products found for "${searchQuery}"` : "No products yet. Add your first product!"}
                              </td>
                            </tr>
                          ) : products.map((p, i) => {
                            const st = statusStyle(p.status);
                            return (
                              <tr key={p.id} className="trow" style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? "white" : "#FAFAFE" }}>
                                <td style={{ padding: "12px 16px" }}>
                                  {p.image || p.image_url
                                    ? <img src={(p.image || p.image_url).startsWith('/') ? `http://127.0.0.1:8000${(p.image || p.image_url)}` : (p.image || p.image_url)} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", border: `2px solid ${C.border}` }} />
                                    : <div style={{ width: 40, height: 40, background: C.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: `2px solid ${C.border}` }}>🏷️</div>
                                  }
                                </td>
                                <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 13.5, color: C.text }}>{p.name}</td>
                                <td style={{ padding: "12px 16px" }}>
                                  <span className="tag" style={{ background: "#EEF2FF", color: "#4F46E5" }}>{p.category_name || "—"}</span>
                                </td>
                                <td style={{ padding: "12px 16px", fontWeight: 700, color: C.primary, fontSize: 14 }}>₹{Number(p.price).toLocaleString("en-IN")}</td>
                                <td style={{ padding: "12px 16px", fontWeight: 600, color: p.stock === 0 ? "#E11D48" : p.stock < 15 ? "#D97706" : C.text, fontSize: 14 }}>{p.stock}</td>
                                <td style={{ padding: "12px 16px" }}>
                                  <span className="tag" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                  <div style={{ display: "flex", gap: 6 }}>
                                    <button className="btn-e" onClick={() => openEditModal(p)} style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600 }}>Edit</button>
                                    <button className="btn-d" onClick={() => handleDelete(p.id)} style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600 }}>Delete</button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Recent Orders */}
                <div className="card" style={{ background: "white", borderRadius: 18, border: `1.5px solid ${C.border}`, boxShadow: "0 2px 16px rgba(0,0,0,.05)", overflow: "hidden" }}>
                  <div style={{ padding: "18px 22px", borderBottom: `1.5px solid ${C.border}` }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text }}>🛒 Recent Orders</h2>
                    <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Last 5 transactions</p>
                  </div>

                  {oLoading ? (
                    <div style={{ padding: 40, display: "flex", justifyContent: "center" }}><Spinner size={28} /></div>
                  ) : (
                    <div style={{ padding: "8px 0" }}>
                      {!(Array.isArray(recentOrders) && recentOrders.length > 0) ? (
                        <div style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 13 }}>
                          {recentVendor
                            ? `No orders yet for ${recentVendor.email || recentVendor.username}.`
                            : "No orders yet."}
                        </div>
                      ) : (
                        recentOrders.map((o, i) => {
                          const st = statusStyle(o.status);
                          return (
                            <div key={o.id} style={{ padding: "13px 20px", borderBottom: i < recentOrders.length - 1 ? `1px solid ${C.border}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="trow">
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 36, height: 36, background: `hsl(${i * 55},75%,95%)`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                                  {["👤", "👥", "🛍️", "📦", "🏃"][i % 5]}
                                </div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{o.customer_name}</div>
                                  <div style={{ fontSize: 11, color: C.muted }}>{o.product_name} · {new Date(o.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</div>
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>₹{Number(o.amount).toLocaleString("en-IN")}</div>
                                <span className="tag" style={{ background: st.bg, color: st.color, marginTop: 2 }}>{st.label}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                  <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
                    <button onClick={() => navigate("/orders")} style={{ background: "none", border: "none", color: C.primary, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "Outfit,sans-serif" }}>View All Orders →</button>
                  </div>
                </div>
              </div>

              {/* ── BOTTOM WIDGETS ──────────────────────────────────────────────── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>

                {/* Weekly sales bar chart */}
                <div className="card" style={{ background: "white", borderRadius: 18, border: `1.5px solid ${C.border}`, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>📈 Weekly Sales</h3>
                  <p style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>Last 7 days revenue</p>
                  {aLoading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: 20 }}><Spinner color={C.blue} /></div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                      {weeklyData.map((v, j) => {
                        const isMax = v === Math.max(...weeklyData);
                        return (
                          <div key={j} style={{ flex: 1, position: "relative" }} title={weeklyLabels[j] || ""}>
                            {isMax && <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontSize: 9, fontWeight: 700, color: C.blue, whiteSpace: "nowrap" }}>Peak</div>}
                            <div style={{ background: isMax ? C.blue : "#EEF2FF", borderRadius: "4px 4px 0 0", height: `${(v / maxWeekly) * 100}%`, minHeight: 4, transition: "height .5s ease" }} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    {weeklyLabels.map((label, j) => (
                      <div key={j} style={{ fontSize: 9, color: C.muted, textAlign: "center", flex: 1 }}>{label}</div>
                    ))}
                  </div>
                </div>

                {/* Category distribution */}
                <div className="card" style={{ background: "white", borderRadius: 18, border: `1.5px solid ${C.border}`, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>🎯 Top Categories</h3>
                  {aLoading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: 20 }}><Spinner color={C.primary} /></div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {categoryWithPct.slice(0, 4).map((cat, j) => {
                        const colors = [C.primary, C.blue, C.green, C.purple];
                        return (
                          <div key={j}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 500, color: C.text, marginBottom: 4 }}>
                              <span>{cat.name}</span>
                              <span style={{ fontWeight: 700, color: colors[j % 4] }}>{cat.percentage}%</span>
                            </div>
                            <div style={{ height: 6, background: C.border, borderRadius: 4, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${cat.percentage}%`, background: colors[j % 4], borderRadius: 4 }} />
                            </div>
                          </div>
                        );
                      })}
                      {!categoryWithPct.length && <div style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: "12px 0" }}>No category data yet.</div>}
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                <div className="card" style={{ background: "white", borderRadius: 18, border: `1.5px solid ${C.border}`, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>⚡ Quick Actions</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { icon: "📦", label: "New Product", color: "#EEF2FF", text: C.blue, fn: openAddModal },
                      { icon: "💬", label: "Messages", color: "#ECFDF5", text: C.green },
                      { icon: "📊", label: "Reports", color: "#FFF3EE", text: C.primary },
                      { icon: "🎁", label: "Promotions", color: "#FAF5FF", text: C.purple },
                    ].map((action, j) => (
                      <button key={j} onClick={action.fn} style={{ background: action.color, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "12px 8px", cursor: "pointer", textAlign: "center", fontFamily: "Outfit,sans-serif", transition: "all .2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.04)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
                        <div style={{ fontSize: 22 }}>{action.icon}</div>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: action.text, marginTop: 4 }}>{action.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ background: "white", borderTop: `2px solid ${C.border}`, padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 32, padding: "28px 0 20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#FF6B35,#A855F7)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 14 }}>M</div>
              <span className="logo-text" style={{ fontSize: 18, fontWeight: 800 }}>MarchFast</span>
            </div>
            <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.7, maxWidth: 240 }}>Empowering vendors to sell faster, smarter, and reach millions of customers instantly.</p>
          </div>
          {[
            { title: "Vendor", links: ["Dashboard", "Products", "Orders", "Analytics"] },
            { title: "Support", links: ["Help Center", "Contact Us", "Seller Guide", "Community"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
          ].map((col, i) => (
            <div key={i}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>{col.title}</h4>
              {col.links.map((link) => (
                <div key={link} style={{ fontSize: 12.5, color: C.muted, marginBottom: 8, cursor: "pointer", transition: "color .2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = C.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = C.muted}>{link}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.muted }}>© 2026 MarchFast. All rights reserved.</span>
          <span style={{ background: "#ECFDF5", color: "#059669", fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>● Connected to API</span>
        </div>
      </footer>

      {/* ── ADD / EDIT PRODUCT MODAL ─────────────────────────────────────────── */}
      {showModal && (
        <div onClick={() => !saving && setShowModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(30,27,46,.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", animation: "fadeIn .2s ease" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 20, padding: 32, width: 460, boxShadow: "0 24px 60px rgba(0,0,0,.2)", border: `1.5px solid ${C.border}`, animation: "slideIn .3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{editTarget ? "✏️ Edit Product" : "🆕 Add Product"}</h2>
                <p style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>Fill in the product details below</p>
              </div>
              <button onClick={() => setShowModal(false)} disabled={saving} style={{ background: C.bg, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 18, color: C.muted }}>✕</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>Product Image</label>

              {previewUrl && (
                <div style={{ marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 12, border: `2px solid ${C.border}` }}
                  />
                  <button
                    onClick={() => { setPreviewUrl(null); setForm({ ...form, image: null }) }}
                    style={{ background: "#FFF1F2", border: "none", color: "#E11D48", padding: "4px 8px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                  >
                    Replace Image
                  </button>
                </div>
              )}

              {!previewUrl && (
                <div style={{ padding: "12px", border: `1.5px dashed ${C.border}`, borderRadius: 10, background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 24, marginBottom: 8 }}>🖼️</span>
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          showToast("Image size must be less than 2MB.");
                          return;
                        }
                        setForm({ ...form, image: file });
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                    style={{ width: "100%", fontSize: 12, cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>JPEG, PNG, WEBP (Max 2MB)</span>
                </div>
              )}
            </div>

            {[
              { label: "Product Name *", key: "name", placeholder: "e.g. Premium Cotton Tee", type: "text" },
              { label: "Price (₹) *", key: "price", placeholder: "e.g. 1500", type: "number" },
              { label: "Stock Quantity", key: "stock", placeholder: "e.g. 50", type: "number" },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, fontFamily: "Outfit,sans-serif", background: C.bg }} />
              </div>
            ))}

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                placeholder="Short product description…"
                style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, fontFamily: "Outfit,sans-serif", background: C.bg, resize: "vertical" }} />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value ? Number(e.target.value) : "" })}
                style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, fontFamily: "Outfit,sans-serif", background: C.bg }}
              >
                <option value="">Select Category</option>
                {categoriesLoading && <option value="">Loading categories...</option>}
                {!categoriesLoading && categories.length === 0 && <option value="">No categories available</option>}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowModal(false)} disabled={saving} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.bg, color: C.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "Outfit,sans-serif" }}>Cancel</button>
              <button className="btn-p" onClick={handleSave} disabled={saving} style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {saving ? <><Spinner size={16} color="white" /> Saving…</> : editTarget ? "Save Changes ✓" : "Add Product ＋"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS PANEL ──────────────────────────────────────────────── */}
      {notifOpen && (
        <div onClick={() => setNotifOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 150, animation: "fadeIn .15s ease" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", top: 72, right: 20, background: "white", borderRadius: 16, width: 320, boxShadow: "0 16px 48px rgba(0,0,0,.15)", border: `1.5px solid ${C.border}`, overflow: "hidden", animation: "slideIn .25s ease" }}>
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text }}>🔔 Notifications</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {unreadCount > 0 && <span style={{ background: C.primary, color: "white", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{unreadCount} new</span>}
                <button onClick={handleMarkAllRead} style={{ background: "none", border: "none", fontSize: 11, color: C.muted, cursor: "pointer" }}>Mark all read</button>
              </div>
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: 28, textAlign: "center", color: C.muted, fontSize: 13 }}>You're all caught up! 🎉</div>
            ) : notifications.slice(0, 6).map((n, i) => {
              const iconMap = { order: "🛍️", stock: "⚠️", review: "⭐", system: "⚙️" };
              const bgMap = { order: "#EEF2FF", stock: "#FFFBEB", review: "#ECFDF5", system: "#FAF5FF" };
              return (
                <div key={n.id} onClick={() => !n.is_read && handleMarkRead(n.id)}
                  style={{ padding: "13px 18px", borderBottom: i < Math.min(notifications.length, 6) - 1 ? `1px solid ${C.border}` : "none", display: "flex", gap: 12, alignItems: "flex-start", cursor: n.is_read ? "default" : "pointer", background: n.is_read ? "white" : "#FFFDF9", transition: "background .15s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.bg}
                  onMouseLeave={(e) => e.currentTarget.style.background = n.is_read ? "white" : "#FFFDF9"}>
                  <div style={{ width: 36, height: 36, background: bgMap[n.type] || C.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{iconMap[n.type] || "🔔"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: n.is_read ? 400 : 600 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{new Date(n.created_at).toRelativeString?.() || new Date(n.created_at).toLocaleDateString()}</div>
                  </div>
                  {!n.is_read && <div style={{ width: 8, height: 8, background: C.primary, borderRadius: "50%", flexShrink: 0, marginTop: 4 }} />}
                </div>
              );
            })}
            <div style={{ padding: "12px 18px", textAlign: "center" }}>
              <button style={{ background: "none", border: "none", color: C.primary, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "Outfit,sans-serif" }}>View all notifications →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
