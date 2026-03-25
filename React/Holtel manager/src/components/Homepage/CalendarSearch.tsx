// src/components/CalendarSearch/CalendarSearch.tsx
import { useState } from "react";
import {
  CalendarOutlined,
  SearchOutlined,
  UserOutlined,
  PlusOutlined,
  MinusOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import RoomCard from "./Roomcard";
import { ALL_ROOMS } from "./rooms";
import "./CalendarSearch.css";

const ROOM_TYPES = [
  { value: "all",      label: "Tất cả" },
  { value: "Standard", label: "Tiêu chuẩn" },
  { value: "Deluxe",   label: "Deluxe" },
  { value: "Suite",    label: "Suite" },
  { value: "Family",   label: "Gia đình" },
];

export default function CalendarSearch() {
  const [checkIn,  setCheckIn]  = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomType, setRoomType] = useState("all");
  const [guests,   setGuests]   = useState(1);

  const today = new Date().toISOString().split("T")[0];

  // giả lập ngày cao điểm
  const isFullDate = checkIn === "2025-09-02";

  const filtered = ALL_ROOMS.filter((r) =>
    roomType === "all" ? true : r.type === roomType
  ).map((r) => ({
    ...r,
    available: isFullDate ? r.id % 3 !== 0 : r.available,
  }));

  return (
    <section className="section cs-section">
      <div className="container">
        <h2 className="section-title">
          <CalendarOutlined className="section-title-icon" />
          Tìm Phòng Theo Ngày
        </h2>
        <p className="section-subtitle">Chọn ngày và loại phòng phù hợp với bạn</p>

        <div className="cs-layout">
          {/* ── Filter panel ── */}
          <div className="cs-panel">
            <h3 className="cs-panel-title">
              <FilterOutlined style={{ marginRight: 8 }} />
              Bộ lọc tìm kiếm
            </h3>

            <label className="cs-label">
              <CalendarOutlined className="cs-label-icon" /> Ngày nhận phòng
            </label>
            <input
              type="date"
              className="cs-input"
              min={today}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />

            <label className="cs-label">
              <CalendarOutlined className="cs-label-icon" /> Ngày trả phòng
            </label>
            <input
              type="date"
              className="cs-input"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />

            <label className="cs-label">Loại phòng</label>
            <select
              className="cs-select"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
            >
              {ROOM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <label className="cs-label">
              <UserOutlined className="cs-label-icon" /> Số khách
            </label>
            <div className="cs-guest-counter">
              <button
                className="cs-counter-btn"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
              >
                <MinusOutlined />
              </button>
              <span className="cs-guest-num">{guests}</span>
              <button
                className="cs-counter-btn"
                onClick={() => setGuests((g) => Math.min(8, g + 1))}
              >
                <PlusOutlined />
              </button>
            </div>

            {checkIn && (
              <div className={`cs-info-box ${isFullDate ? "warning" : "success"}`}>
                {isFullDate ? (
                  <>
                    <WarningOutlined style={{ marginRight: 6 }} />
                    Ngày 2/9 rất đông! Nhiều phòng đã được đặt.
                  </>
                ) : (
                  <>
                    <CheckCircleOutlined style={{ marginRight: 6 }} />
                    Còn nhiều phòng trống cho ngày này!
                  </>
                )}
              </div>
            )}

            <button className="cs-search-btn">
              <SearchOutlined style={{ marginRight: 8 }} />
              Tìm phòng
            </button>
          </div>

          {/* ── Results ── */}
          <div className="cs-results">
            {filtered.length === 0 ? (
              <div className="cs-no-results">Không tìm thấy phòng phù hợp.</div>
            ) : (
              <div className="room-grid">
                {filtered.map((room) => (
                  <RoomCard key={room.id} room={room} compact />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
