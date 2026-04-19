import { useState } from "react";
import {
  LeftOutlined,
  StarFilled,
  WifiOutlined,
  CheckCircleOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  CalendarOutlined,
  UserOutlined,
  FireOutlined,
  HomeOutlined,
  ThunderboltOutlined,
  DesktopOutlined,
  ExperimentOutlined,
  CoffeeOutlined,
  CarOutlined,
  RestOutlined,
  AlertOutlined,
  EnvironmentOutlined,
  SunOutlined,
  BgColorsOutlined,
} from "@ant-design/icons";
import { ALL_ROOMS, COMMENTS } from "../components/Homepage/rooms";
import "../assets/css/RoomDetail/RoomDetail.css";

// Dùng phòng đầu tiên làm demo
const room = ALL_ROOMS[0];

const AMENITIES = [
  { icon: <WifiOutlined />,        label: "WiFi tốc độ cao" },
  { icon: <ThunderboltOutlined />, label: "Điều hòa" },
  { icon: <DesktopOutlined />,     label: 'Smart TV 55"' },
  { icon: <ExperimentOutlined />,  label: "Bồn tắm cao cấp" },
  { icon: <CoffeeOutlined />,      label: "Minibar" },
  { icon: <CarOutlined />,         label: "Bãi đỗ xe" },
  { icon: <RestOutlined />,        label: "Bữa sáng" },
  { icon: <AlertOutlined />,       label: "Hồ bơi" },
];

export default function RoomDetail() {
  const [liked, setLiked]       = useState(false);
  const [checkIn, setCheckIn]   = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests]     = useState(1);
  const [tab, setTab]           = useState<"info" | "reviews">("info");

  const today = new Date().toISOString().split("T")[0];

  const nights = checkIn && checkOut
    ? Math.max(0, (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
    : 0;
  const total = nights * room.price;

  return (
    <div className="rd-page">
      {/* Back */}
      <div className="rd-back-bar">
        <div className="container">
          <button className="rd-back-btn">
            <LeftOutlined /> Quay lại danh sách
          </button>
        </div>
      </div>

      <div className="container rd-body">
        {/* Left */}
        <div className="rd-left">
          {/* Images */}
          <div className="rd-img-grid">
            <div className="rd-img-main rd-img-placeholder"><HomeOutlined /></div>
            <div className="rd-img-sub rd-img-placeholder"><EnvironmentOutlined /></div>
            <div className="rd-img-sub rd-img-placeholder"><BgColorsOutlined /></div>
            <div className="rd-img-sub rd-img-placeholder"><ExperimentOutlined /></div>
            <div className="rd-img-sub rd-img-placeholder"><SunOutlined /></div>
          </div>

          {/* Info */}
          <div className="rd-info-card">
            <div className="rd-info-top">
              <div>
                <span className="rd-type-badge">{room.type}</span>
                {room.popular && (
                  <span className="rd-popular-badge">
                    <FireOutlined /> Phổ biến
                  </span>
                )}
              </div>
              <div className="rd-actions">
                <button className="rd-action-btn" onClick={() => setLiked((p) => !p)}>
                  {liked ? <HeartFilled style={{ color: "#ef4444" }} /> : <HeartOutlined />}
                </button>
                <button className="rd-action-btn">
                  <ShareAltOutlined />
                </button>
              </div>
            </div>

            <h1 className="rd-name">{room.name}</h1>

            <div className="rd-rating-row">
              {[1,2,3,4,5].map((i) => (
                <StarFilled key={i} className={i <= Math.round(room.rating) ? "rd-star filled" : "rd-star"} />
              ))}
              <span className="rd-rating-num">{room.rating.toFixed(1)}</span>
              <span className="rd-reviews">({room.reviews} đánh giá)</span>
            </div>

            {/* Tabs */}
            <div className="rd-tabs">
              <button
                className={`rd-tab${tab === "info" ? " active" : ""}`}
                onClick={() => setTab("info")}
              >Thông tin</button>
              <button
                className={`rd-tab${tab === "reviews" ? " active" : ""}`}
                onClick={() => setTab("reviews")}
              >Đánh giá ({COMMENTS.length})</button>
            </div>

            {tab === "info" ? (
              <>
                <p className="rd-desc">
                  Phòng {room.name} mang đến không gian sang trọng với tầm nhìn tuyệt đẹp.
                  Nội thất cao cấp, thiết bị hiện đại cùng dịch vụ 5 sao sẽ làm hài lòng
                  mọi yêu cầu của quý khách. Diện tích 45m², đón gió tự nhiên và ánh sáng
                  chan hòa suốt ngày.
                </p>

                <h3 className="rd-section-title">Tiện nghi</h3>
                <div className="rd-amenities">
                  {AMENITIES.map((a) => (
                    <div key={a.label} className="rd-amenity">
                      <span className="rd-amenity-icon">{a.icon}</span>
                      <span>{a.label}</span>
                    </div>
                  ))}
                </div>

                <h3 className="rd-section-title">Chính sách</h3>
                <div className="rd-policies">
                  <div className="rd-policy">
                    <CheckCircleOutlined className="rd-policy-icon" />
                    Nhận phòng: 14:00 — Trả phòng: 12:00
                  </div>
                  <div className="rd-policy">
                    <CheckCircleOutlined className="rd-policy-icon" />
                    Không hút thuốc trong phòng
                  </div>
                  <div className="rd-policy">
                    <CheckCircleOutlined className="rd-policy-icon" />
                    Hủy miễn phí trước 24h
                  </div>
                </div>
              </>
            ) : (
              <div className="rd-reviews-list">
                {COMMENTS.map((c) => (
                  <div key={c.id} className="rd-review-item">
                    <img src={c.avatar} alt={c.name} className="rd-review-avatar" />
                    <div className="rd-review-content">
                      <div className="rd-review-name">{c.name}</div>
                      <div className="rd-review-stars">
                        {[1,2,3,4,5].map((i) => (
                          <StarFilled key={i} className={i <= c.rating ? "rd-star filled" : "rd-star"} style={{ fontSize: 12 }} />
                        ))}
                        <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4 }}>{c.date}</span>
                      </div>
                      <p className="rd-review-text">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right - Booking */}
        <aside className="rd-booking-card">
          <div className="rd-price-block">
            <span className="rd-price">{room.price.toLocaleString("vi-VN")}₫</span>
            <span className="rd-price-unit"> /đêm</span>
            {room.originalPrice && (
              <div className="rd-orig-price">
                {room.originalPrice.toLocaleString("vi-VN")}₫
              </div>
            )}
          </div>

          <div className="rd-booking-form">
            <div className="rd-form-row">
              <div className="rd-form-group">
                <label className="rd-form-label">
                  <CalendarOutlined /> Nhận phòng
                </label>
                <input
                  type="date"
                  className="rd-form-input"
                  min={today}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
              <div className="rd-form-group">
                <label className="rd-form-label">
                  <CalendarOutlined /> Trả phòng
                </label>
                <input
                  type="date"
                  className="rd-form-input"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>

            <div className="rd-form-group">
              <label className="rd-form-label">
                <UserOutlined /> Số khách
              </label>
              <select className="rd-form-input" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                {[1,2,3,4].map((n) => (
                  <option key={n} value={n}>{n} khách</option>
                ))}
              </select>
            </div>

            {nights > 0 && (
              <div className="rd-price-calc">
                <div className="rd-calc-row">
                  <span>{room.price.toLocaleString("vi-VN")}₫ × {nights} đêm</span>
                  <span>{total.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="rd-calc-row total">
                  <span>Tổng cộng</span>
                  <span>{total.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>
            )}

            <button className="rd-book-btn">
              Đặt phòng ngay
            </button>

            <p className="rd-book-note">Chưa bị trừ tiền — xác nhận sau</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
