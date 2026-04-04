// src/components/Navbar.jsx
// Simple top navigation for unauthenticated/authenticated flows.

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const isMobile = window.innerWidth < 768;

  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 24px",
      borderBottom: "1px solid #E5E7EB",
      background: "white",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link to="/" style={{ fontWeight: 800, color: "#111827", textDecoration: "none", fontSize: 18 }}>
          MarchFast
        </Link>
        <span style={{ color: "#6B7280", fontSize: 13 }}>Vendor dashboard</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user ? (
          <>
            <span style={{ color: "#374151", fontSize: 13, fontWeight: 600 }}>
              {user.store_name || user.username || "Vendor"}
            </span>
            {!isMobile && (
              <button
                onClick={logout}
                style={{
                  border: "1px solid #E5E7EB",
                  background: "white",
                  padding: "8px 12px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Logout
              </button>
            )}
          </>
        ) : (
          <>
            {!isMobile && (
              <>
                <Link to="/login" style={{ color: "#3B82F6", fontWeight: 600, fontSize: 13 }}>
                  Login
                </Link>
                <Link to="/register" style={{ color: "#10B981", fontWeight: 600, fontSize: 13 }}>
                  Sign up
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
