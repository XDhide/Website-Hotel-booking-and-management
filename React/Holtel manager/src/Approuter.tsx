import { useState, useEffect } from "react";
import { isLoggedIn, isAdmin } from "./constant/api";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/Homepage";
import RoomList from "./pages/RoomList";
import RoomDetail from "./pages/RoomDetail";
import BookingPage from "./pages/BookingPage";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import BookingHistory from "./pages/BookingHistory";
import CurrentBookings from "./pages/CurrentBookings";

function getPath() {
  return window.location.pathname;
}

export default function AppRouter() {
  const [path, setPath] = useState(getPath());

  useEffect(() => {
    const onPop = () => setPath(getPath());
    window.addEventListener("popstate", onPop);

    const onNavigate = (e: any) => {
      window.history.pushState(null, "", e.detail);
      setPath(e.detail);
    };
    window.addEventListener("navigate", onNavigate);

    const onLogout = () => {
      window.history.pushState(null, "", "/");
      setPath("/");
    };
    window.addEventListener("auth:logout", onLogout);

    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("navigate", onNavigate);
      window.removeEventListener("auth:logout", onLogout);
    };
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

  if (path.startsWith("/rooms/")) {
    const id = parseInt(path.split("/rooms/")[1], 10);
    return <RoomDetail roomTypeId={isNaN(id) ? undefined : id} />;
  }

  if (path.startsWith("/booking")) {
    if (!isLoggedIn()) {
      window.history.replaceState(null, "", "/");
      return <HomePage />;
    }
    const params = new URLSearchParams(window.location.search);
    const roomTypeId = parseInt(params.get("roomTypeId") ?? "", 10);
    return (
      <BookingPage
        roomTypeId={isNaN(roomTypeId) ? undefined : roomTypeId}
        checkIn={params.get("checkIn") ?? ""}
        checkOut={params.get("checkOut") ?? ""}
        guests={parseInt(params.get("guests") ?? "1", 10)}
      />
    );
  }

  if (path === "/rooms") {
    return <RoomList />;
  }

  if (path === "/favorites") {
    if (!isLoggedIn()) {
      window.history.replaceState(null, "", "/");
      return <HomePage />;
    }
    return <Favorites />;
  }

  if (path === "/profile") {
    if (!isLoggedIn()) {
      window.history.replaceState(null, "", "/");
      return <HomePage />;
    }
    return <Profile />;
  }

  if (path === "/bookings") {
    if (!isLoggedIn()) {
      window.history.replaceState(null, "", "/");
      return <HomePage />;
    }
    return <CurrentBookings />;
  }

  if (path === "/booking-history") {
    if (!isLoggedIn()) {
      window.history.replaceState(null, "", "/");
      return <HomePage />;
    }
    return <BookingHistory />;
  }

  return <HomePage />;
}

// Helper để navigate từ bất kỳ đâu
export const navigate = (to: string) => {
  window.dispatchEvent(new CustomEvent("navigate", { detail: to }));
};
