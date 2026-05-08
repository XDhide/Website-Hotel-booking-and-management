import {
  LoadingOutlined,
  SearchOutlined,
  ReloadOutlined,
  LoginOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import "../../../assets/css/Adminpage/HomeAdmin.css";

export interface Booking {
  id: number;
  userId: string;
  roomTypeId: number;
  roomTypeName?: string;
  fromDate: string;
  toDate: string;
  status: string;
  createdAt: string;
  deposit?: number;
  roomNumber?: string;
}

const BOOKING_STATUS_COLOR: Record<string, string> = {
  Pending: "#f59e0b",
  Confirmed: "#3b82f6",
  CheckedIn: "#22c55e",
  CheckedOut: "#6b7280",
  Cancelled: "#ef4444",
};
const BOOKING_STATUS_LABEL: Record<string, string> = {
  Pending: "Chờ xác nhận",
  Confirmed: "Đã xác nhận",
  CheckedIn: "Đang ở",
  CheckedOut: "Đã trả phòng",
  Cancelled: "Đã hủy",
};
const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString("vi-VN") : "—";

interface Props {
  bookings: Booking[];
  loading: boolean;
  tab: "pending" | "active" | "all";
  search: string;
  page: number;
  totalPages: number;
  onTabChange: (t: "pending" | "active" | "all") => void;
  onSearchChange: (v: string) => void;
  onPageChange: (p: number) => void;
  onReload: () => void;
  onCheckIn: (b: Booking) => void;
}

export default function BookingTable({
  bookings,
  loading,
  tab,
  search,
  page,
  totalPages,
  onTabChange,
  onSearchChange,
  onPageChange,
  onReload,
  onCheckIn,
}: Props) {
  const filtered = bookings.filter((b) => {
    const matchTab =
      tab === "all" ||
      (tab === "pending" && ["Pending", "Confirmed"].includes(b.status)) ||
      (tab === "active" && b.status === "CheckedIn");
    const q = search.toLowerCase();
    return (
      matchTab &&
      (!q ||
        String(b.id).includes(q) ||
        (b.roomTypeName ?? "").toLowerCase().includes(q))
    );
  });

  return (
    <div className="booking-table-wrap">
      <div className="booking-table-header">
        <span className="booking-table-title">
          <HomeOutlined /> Quản lý Booking
        </span>
        <div className="booking-table-controls">
          {(["pending", "active", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className={`booking-tab-btn ${tab === t ? "active" : "inactive"}`}
            >
              {t === "pending"
                ? "Chờ xác nhận"
                : t === "active"
                  ? "Đang ở"
                  : "Tất cả"}
            </button>
          ))}
          <div className="booking-search-wrap">
            <SearchOutlined />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm ID / loại phòng..."
            />
          </div>
          <button className="booking-reload-btn" onClick={onReload}>
            <ReloadOutlined />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="booking-table-empty">
          <LoadingOutlined /> Đang tải...
        </div>
      ) : filtered.length === 0 ? (
        <div className="booking-table-empty">Không có booking nào</div>
      ) : (
        <div className="booking-table-scroll">
          <table className="booking-table">
            <thead>
              <tr>
                {[
                  "#ID",
                  "Loại phòng",
                  "Từ ngày",
                  "Đến ngày",
                  "Trạng thái",
                  "Hành động",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((bk) => (
                <tr key={bk.id}>
                  <td className="booking-id-td">#{bk.id}</td>
                  <td className="booking-type-td">
                    {bk.roomTypeName ?? `Loại #${bk.roomTypeId}`}
                  </td>
                  <td className="booking-date-td">{fmtDate(bk.fromDate)}</td>
                  <td className="booking-date-td">{fmtDate(bk.toDate)}</td>
                  <td>
                    <span
                      className="booking-status-badge"
                      style={{
                        background: `${BOOKING_STATUS_COLOR[bk.status] ?? "#6b7280"}22`,
                        color: BOOKING_STATUS_COLOR[bk.status] ?? "#9ca3af",
                        border: `1px solid ${BOOKING_STATUS_COLOR[bk.status] ?? "#6b7280"}44`,
                      }}
                    >
                      {BOOKING_STATUS_LABEL[bk.status] ?? bk.status}
                    </span>
                  </td>
                  <td>
                    {["Pending", "Confirmed"].includes(bk.status) && (
                      <button
                        className="booking-checkin-btn"
                        onClick={() => onCheckIn(bk)}
                      >
                        <LoginOutlined /> Check-in
                      </button>
                    )}
                    {bk.status === "CheckedIn" && (
                      <span
                        className="booking-date-td"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Đang ở
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="booking-table-pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`booking-page-btn ${p === page ? "active" : "inactive"}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
