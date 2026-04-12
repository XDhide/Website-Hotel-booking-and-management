import { useState } from "react";
import type { ReactNode } from "react";
import {
  HistoryOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  EyeOutlined,
  StarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import "../assets/css/Profile/BookingHistory.css";

type Status = "completed" | "upcoming" | "cancelled";

interface Booking {
  id: string;
  room: string;
  type: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  total: number;
  status: Status;
  rated: boolean;
}

const BOOKINGS: Booking[] = [
  { id: "BK001", room: "Phòng Deluxe Hướng Biển", type: "Deluxe",   checkIn: "2025-03-10", checkOut: "2025-03-13", nights: 3, guests: 2, total: 3_600_000, status: "completed", rated: true  },
  { id: "BK002", room: "Suite Cao Cấp",             type: "Suite",    checkIn: "2025-06-20", checkOut: "2025-06-22", nights: 2, guests: 2, total: 5_600_000, status: "upcoming",  rated: false },
  { id: "BK003", room: "Phòng Tiêu Chuẩn",          type: "Standard", checkIn: "2024-12-24", checkOut: "2024-12-26", nights: 2, guests: 1, total: 1_300_000, status: "completed", rated: false },
  { id: "BK004", room: "Phòng Gia Đình",             type: "Family",   checkIn: "2025-01-15", checkOut: "2025-01-17", nights: 2, guests: 4, total: 3_600_000, status: "cancelled", rated: false },
  { id: "BK005", room: "Phòng Deluxe Twin",          type: "Deluxe",   checkIn: "2025-04-01", checkOut: "2025-04-03", nights: 2, guests: 2, total: 2_200_000, status: "upcoming",  rated: false },
  { id: "BK006", room: "Phòng Superior Twin",        type: "Superior", checkIn: "2024-11-05", checkOut: "2024-11-07", nights: 2, guests: 2, total: 1_960_000, status: "completed", rated: true  },
];

const STATUS_CONFIG: Record<Status, { label: string; icon: ReactNode ; className: string }> = {
  completed: { label: "Hoàn thành", icon: <CheckCircleOutlined />, className: "completed" },
  upcoming:  { label: "Sắp tới",    icon: <ClockCircleOutlined />, className: "upcoming"  },
  cancelled: { label: "Đã hủy",     icon: <CloseCircleOutlined />, className: "cancelled" },
};

const FILTER_TABS: Array<{ key: Status | "all"; label: string }> = [
  { key: "all",       label: "Tất cả"     },
  { key: "upcoming",  label: "Sắp tới"    },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy"     },
];

export default function BookingHistory() {
  const [filter, setFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");

  const bookings = BOOKINGS.filter((b) => {
    const matchFilter = filter === "all" || b.status === filter;
    const matchSearch = b.room.toLowerCase().includes(search.toLowerCase()) || b.id.includes(search);
    return matchFilter && matchSearch;
  });

  return (
    <div className="bh-page">
      <div className="bh-header">
        <div className="container">
          <h1 className="bh-title"><HistoryOutlined /> Lịch Sử Đặt Phòng</h1>
          <p className="bh-sub">Tổng {BOOKINGS.length} lần đặt phòng</p>
        </div>
      </div>

      <div className="container bh-body">
        {/* Stats */}
        <div className="bh-stats">
          {[
            { label: "Tổng đặt phòng", value: BOOKINGS.length,                               color: "#3b82f6" },
            { label: "Hoàn thành",     value: BOOKINGS.filter(b => b.status === "completed").length, color: "#22c55e" },
            { label: "Sắp tới",        value: BOOKINGS.filter(b => b.status === "upcoming").length,  color: "#f59e0b" },
            { label: "Đã hủy",         value: BOOKINGS.filter(b => b.status === "cancelled").length, color: "#ef4444" },
          ].map((s) => (
            <div key={s.label} className="bh-stat-card">
              <div className="bh-stat-num" style={{ color: s.color }}>{s.value}</div>
              <div className="bh-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bh-filters">
          <div className="bh-filter-tabs">
            {FILTER_TABS.map((t) => (
              <button
                key={t.key}
                className={`bh-filter-tab${filter === t.key ? " active" : ""}`}
                onClick={() => setFilter(t.key)}
              >{t.label}</button>
            ))}
          </div>
          <div className="bh-search-wrap">
            <SearchOutlined className="bh-search-icon" />
            <input
              className="bh-search-input"
              placeholder="Tìm mã đặt phòng, tên phòng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        {bookings.length === 0 ? (
          <div className="bh-empty">
            <div className="bh-empty-icon"><FileTextOutlined /></div>
            <p>Không tìm thấy đặt phòng nào</p>
          </div>
        ) : (
          <div className="bh-table-wrap">
            <table className="bh-table">
              <thead>
                <tr>
                  <th>Mã đặt</th>
                  <th>Tên phòng</th>
                  <th>Nhận phòng</th>
                  <th>Trả phòng</th>
                  <th>Đêm / Khách</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const st = STATUS_CONFIG[b.status];
                  return (
                    <tr key={b.id}>
                      <td><span className="bh-id">{b.id}</span></td>
                      <td>
                        <div className="bh-room-name">{b.room}</div>
                        <div className="bh-room-type">{b.type}</div>
                      </td>
                      <td className="bh-date">{b.checkIn}</td>
                      <td className="bh-date">{b.checkOut}</td>
                      <td className="bh-nights">{b.nights} đêm · {b.guests} khách</td>
                      <td><span className="bh-total">{b.total.toLocaleString("vi-VN")}₫</span></td>
                      <td>
                        <span className={`bh-status ${st.className}`}>
                          {st.icon} {st.label}
                        </span>
                      </td>
                      <td>
                        <div className="bh-actions">
                          <button className="bh-action-btn view" title="Chi tiết">
                            <EyeOutlined />
                          </button>
                          {b.status === "completed" && !b.rated && (
                            <button className="bh-action-btn rate" title="Đánh giá">
                              <StarOutlined />
                            </button>
                          )}
                          {b.status === "upcoming" && (
                            <button className="bh-action-btn cancel" title="Hủy">
                              <CloseCircleOutlined />
                            </button>
                          )}
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
    </div>
  );
}
