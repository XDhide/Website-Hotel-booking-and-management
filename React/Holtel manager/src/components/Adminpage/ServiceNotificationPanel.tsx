import {
  apiGetServiceNotifications,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
} from "../../services/InvoiceService";
import { useState, useEffect, useCallback } from "react";
import {
  BellOutlined,
  CheckOutlined,
  ReloadOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import "../../assets/css/Adminpage/ServiceNotificationPanel.css";

interface Notif {
  id: number;
  invoiceDetailId: number;
  invoiceId: number;
  roomUseId: number;
  userId: string;
  roomNumber: string;
  roomTypeName: string;
  serviceName: string;
  quantity: number;
  totalPrice: number;
  isRead: boolean;
  createdAt: string;
}

const fmt = (v?: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v ?? 0,
  );

const fmtTime = (s: string) => {
  try {
    return new Date(s).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
};

export default function ServiceNotificationPanel() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [marking, setMarking] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetServiceNotifications();
      setNotifs(Array.isArray(data) ? data : ((data as any)?.data ?? []));
    } catch {
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const markRead = async (id: number) => {
    setMarking(id);
    try {
      await apiMarkNotificationRead(id);
      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch {
    } finally {
      setMarking(null);
    }
  };

  const markAllRead = async () => {
    try {
      await apiMarkAllNotificationsRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const filtered =
    filter === "unread" ? notifs.filter((n) => !n.isRead) : notifs;
  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return (
    <div className="snp-wrapper">
      <div className="snp-header">
        <div className="snp-header-left">
          <h2>
            <BellOutlined /> Thông báo gọi dịch vụ
            {unreadCount > 0 && (
              <span className="snp-unread-badge">{unreadCount} mới</span>
            )}
          </h2>
          <p>
            Yêu cầu dịch vụ từ khách đang lưu trú — tự động cập nhật mỗi 15 giây
          </p>
        </div>
        <div className="snp-header-actions">
          {unreadCount > 0 && (
            <button className="snp-btn-mark-all" onClick={markAllRead}>
              <CheckOutlined /> Đánh dấu tất cả đã đọc
            </button>
          )}
          <button className="snp-btn-reload" onClick={load}>
            <ReloadOutlined />
          </button>
        </div>
      </div>

      <div className="snp-filter-tabs">
        {[
          { key: "all", label: `Tất cả (${notifs.length})` },
          { key: "unread", label: `Chưa đọc (${unreadCount})` },
        ].map((f) => (
          <button
            key={f.key}
            className={`snp-filter-btn${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key as "all" | "unread")}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="snp-loading">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className="snp-empty">
          <BellOutlined className="snp-empty-icon" />
          {filter === "unread"
            ? "Không có thông báo mới"
            : "Chưa có yêu cầu dịch vụ nào"}
        </div>
      ) : (
        <div className="snp-list">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`snp-card ${n.isRead ? "read" : "unread"}`}
            >
              <div className={`snp-icon-box ${n.isRead ? "read" : "unread"}`}>
                <CustomerServiceOutlined />
              </div>

              <div className="snp-card-content">
                <div className={`snp-room-row ${n.isRead ? "read" : "unread"}`}>
                  <HomeOutlined className="snp-room-icon" />
                  Phòng {n.roomNumber}
                  <span className="snp-room-type">· {n.roomTypeName}</span>
                </div>
                <div
                  className={`snp-service-row ${n.isRead ? "read" : "unread"}`}
                >
                  Yêu cầu: <strong>{n.serviceName}</strong> × {n.quantity}
                </div>
                <div className="snp-meta-row">
                  <span>
                    <ClockCircleOutlined className="snp-meta-time-icon" />
                    {fmtTime(n.createdAt)}
                  </span>
                  <span>HĐ #{n.invoiceId}</span>
                </div>
              </div>

              <div className="snp-card-right">
                <span className="snp-price">{fmt(n.totalPrice)}</span>
                {!n.isRead && (
                  <button
                    className="snp-btn-read"
                    onClick={() => markRead(n.id)}
                    disabled={marking === n.id}
                  >
                    {marking === n.id ? "..." : "✓ Đã nhận"}
                  </button>
                )}
                {n.isRead && <span className="snp-read-label">Đã đọc</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
