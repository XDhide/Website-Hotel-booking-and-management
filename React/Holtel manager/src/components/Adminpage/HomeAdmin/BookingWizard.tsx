import {
  LoadingOutlined,
  SearchOutlined,
  HomeOutlined,
  CheckOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import Modal from "../Modal";
import type { Booking } from "./BookingTable";
import "../../../assets/css/Adminpage/HomeAdmin.css";

export interface RoomTypeItem {
  id: number;
  name: string;
  capacity: string;
  availableRooms: number;
  totalRooms: number;
  images: { imageUrl: string }[];
}

interface RoomPickerProps {
  roomTypes: RoomTypeItem[];
  loading: boolean;
  search: string;
  selected: RoomTypeItem | null;
  onSearchChange: (v: string) => void;
  onSelect: (rt: RoomTypeItem) => void;
  onClose: () => void;
  onNext: () => void;
}

export function RoomPickerModal({
  roomTypes,
  loading,
  search,
  selected,
  onSearchChange,
  onSelect,
  onClose,
  onNext,
}: RoomPickerProps) {
  const available = roomTypes.filter(
    (rt) =>
      rt.availableRooms > 0 &&
      rt.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal
      title="Chọn loại phòng"
      onClose={onClose}
      onSave={() => selected && onNext()}
    >
      <div className="bw-modal-col">
        <div className="bw-search-wrap">
          <SearchOutlined style={{ color: "rgba(255,255,255,0.4)" }} />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm loại phòng..."
          />
        </div>

        {loading ? (
          <div className="bw-loading">
            <LoadingOutlined /> Đang tải...
          </div>
        ) : available.length === 0 ? (
          <div className="bw-empty">
            <HomeOutlined
              style={{ fontSize: 28, display: "block", marginBottom: 8 }}
            />
            Không có loại phòng nào còn trống
          </div>
        ) : (
          <div className="bw-grid">
            {available.map((rt) => {
              const cover = rt.images?.[0]?.imageUrl;
              const isSelected = selected?.id === rt.id;
              return (
                <div
                  key={rt.id}
                  onClick={() => onSelect(rt)}
                  className="bw-card"
                  style={{
                    border: `2px solid ${isSelected ? "#3b82f6" : "rgba(255,255,255,0.08)"}`,
                    background: isSelected
                      ? "rgba(59,130,246,0.1)"
                      : "rgba(255,255,255,0.03)",
                  }}
                >
                  {cover ? (
                    <img src={cover} alt={rt.name} className="bw-card-img" />
                  ) : (
                    <div className="bw-card-img-placeholder">
                      <HomeOutlined />
                    </div>
                  )}
                  <div className="bw-card-body">
                    <div className="bw-card-title">{rt.name}</div>
                    <div className="bw-card-cap">{rt.capacity}</div>
                    <div className="bw-card-avail">
                      <span className="bw-card-avail-dot" />
                      {rt.availableRooms} phòng trống
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selected && (
          <div className="bw-selected-info">
            <CheckOutlined style={{ marginRight: 6 }} />
            Đã chọn: {selected.name} ({selected.availableRooms} phòng trống)
          </div>
        )}
      </div>
    </Modal>
  );
}

interface BookingFormProps {
  roomType: RoomTypeItem;
  checkIn: string;
  checkOut: string;
  guests: number;
  saving: boolean;
  today: string;
  onCheckInChange: (v: string) => void;
  onCheckOutChange: (v: string) => void;
  onGuestsChange: (v: number) => void;
  onClose: () => void;
  onSave: () => void;
}

export function BookingFormModal({
  roomType,
  checkIn,
  checkOut,
  guests,
  saving,
  today,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onClose,
  onSave,
}: BookingFormProps) {
  return (
    <Modal
      title={`Booking — ${roomType.name}`}
      onClose={onClose}
      onSave={onSave}
    >
      <div className="bw-modal-col">
        <div className="bw-selected-info" style={{ marginTop: 0 }}>
          <HomeOutlined style={{ marginRight: 6 }} />
          {roomType.name} — {roomType.availableRooms} phòng trống
        </div>
        <div className="bw-info-alert">
          Sau khi tạo booking, vào danh sách booking và nhấn{" "}
          <strong>Check-in</strong> để xác nhận khách vào phòng và tạo hóa đơn.
        </div>
        <div className="bw-form-grid">
          {[
            { lbl: "Ngày nhận phòng", val: checkIn, onChange: onCheckInChange },
            {
              lbl: "Ngày trả phòng",
              val: checkOut,
              onChange: onCheckOutChange,
            },
          ].map(({ lbl, val, onChange }) => (
            <div key={lbl} className="form-group">
              <label>{lbl}</label>
              <input
                type="date"
                value={val}
                min={today}
                onChange={(e) => onChange(e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="form-group">
          <label>Số khách</label>
          <input
            type="number"
            min={1}
            max={10}
            value={guests}
            onChange={(e) => onGuestsChange(Number(e.target.value))}
          />
        </div>
        {saving && (
          <div className="bw-loading-text">
            <LoadingOutlined className="bw-icon-margin" />
            Đang tạo booking...
          </div>
        )}
      </div>
    </Modal>
  );
}

interface CheckInProps {
  booking: Booking;
  doing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString("vi-VN") : "—";

export function CheckInModal({
  booking,
  doing,
  onClose,
  onConfirm,
}: CheckInProps) {
  return (
    <Modal
      title={`Check-in Booking #${booking.id}`}
      onClose={onClose}
      onSave={onConfirm}
    >
      <div className="bw-modal-col">
        <div className="bw-checkin-alert">
          <p className="bw-checkin-title">
            <LoginOutlined className="bw-icon-margin" />
            Xác nhận Check-in
          </p>
          <p className="bw-checkin-desc">
            Khi nhấn <strong>Xác nhận</strong>, hệ thống sẽ:
          </p>
          <ul className="bw-checkin-list">
            <li>Gán phòng trống cho booking</li>
            <li>Tạo hóa đơn (chưa thanh toán)</li>
            <li>Cập nhật trạng thái → Đang ở</li>
          </ul>
        </div>
        {[
          ["Booking ID", `#${booking.id}`],
          ["Loại phòng", booking.roomTypeName ?? `Loại #${booking.roomTypeId}`],
          ["Từ ngày", fmtDate(booking.fromDate)],
          ["Đến ngày", fmtDate(booking.toDate)],
        ].map(([l, v]) => (
          <div key={l} className="bw-checkin-row">
            <span className="bw-checkin-label">{l}</span>
            <span className="bw-checkin-val">{v}</span>
          </div>
        ))}
        {doing && (
          <div className="bw-loading-text">
            <LoadingOutlined className="bw-icon-margin" />
            Đang xử lý check-in...
          </div>
        )}
      </div>
    </Modal>
  );
}
