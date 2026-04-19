import { useState, useEffect } from "react";
import { isLoggedIn, isAdmin } from "./constant/api";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/Homepage";

// Simple hash-based router (không cần react-router-dom)
function getPath() {
  return window.location.pathname;
}

export default function AppRouter() {
  const [path, setPath] = useState(getPath());

  useEffect(() => {
    const onPop = () => setPath(getPath());
    window.addEventListener("popstate", onPop);
    // Lắng nghe navigation tùy chỉnh
    window.addEventListener("navigate", (e: any) => {
      window.history.pushState(null, "", e.detail);
      setPath(e.detail);
    });
    // Sau khi đăng xuất → về /
    window.addEventListener("auth:logout", () => {
      window.history.pushState(null, "", "/");
      setPath("/");
    });
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Guard: /admin chỉ cho Admin/Manager
  if (path.startsWith("/admin")) {
    if (!isLoggedIn()) {
      window.history.replaceState(null, "", "/");
      return <HomePage />;
    }
    if (!isAdmin()) {
      return (
        <div style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "#0f1117", color: "#fff", gap: 16,
        }}>
          <div style={{ fontSize: "3rem" }}>🔒</div>
          <h2>Bạn không có quyền truy cập trang Admin</h2>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>
            Tài khoản của bạn không có vai trò Admin hoặc Manager.
          </p>
          <button
            onClick={() => { window.history.pushState(null, "", "/"); setPath("/"); }}
            style={{
              background: "#3b82f6", color: "#fff", border: "none",
              borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontSize: "0.95rem",
            }}
          >
            Về trang chủ
          </button>
        </div>
      );
    }
    return <AdminPage />;
  }

  return <HomePage />;
}

// Helper để navigate từ bất kỳ đâu
export const navigate = (to: string) => {
  window.dispatchEvent(new CustomEvent("navigate", { detail: to }));
};