import { useState, useEffect } from "react";
import { isLoggedIn } from "../constant/api";
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
  PictureOutlined,
} from "@ant-design/icons";
import { apiGetReviews } from "../services/ReviewService";
import { navigate } from "../Approuter.tsx";
import Header from "../shared/Header";
import Footer from "../shared/Fooder";
import { apiGetRoomTypeById } from "../services/RoomTypeService";
import "../assets/css/RoomDetail/RoomDetail.css";

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

interface Props {
  roomTypeId?: number;
}

export default function RoomDetail({ roomTypeId }: Props) {
  const [roomType, setRoomType]   = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [liked, setLiked]         = useState(false);
  const [checkIn, setCheckIn]     = useState("");
  const [checkOut, setCheckOut]   = useState("");
  const [guests, setGuests]       = useState(1);
  const [tab, setTab]             = useState<"info" | "reviews">("info");
  const [activeImg, setActiveImg] = useState(0);
  const [reviews, setReviews]     = useState<any[]>([]);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    apiGetReviews(1, 20)
      .then((res) => setReviews(res?.data ?? []))
      .catch(() => setReviews([]));
  }, []);

  useEffect(() => {
    if (!roomTypeId) {
      setLoading(false);
      return;
    }
    apiGetRoomTypeById(roomTypeId).then((data) => {
      setRoomType(data);
      setLoading(false);
    });
  }, [roomTypeId]);

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
        )
      : 0;

  const images: any[] = roomType?.images ?? [];

  if (loading) {
    return (
      <div className="rd-page">
        <Header />
        <div className="container rd-body" style={{ justifyContent: "center", padding: "80px 0" }}>
          <p>Đang tải...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!roomType) {
    return (
      <div className="rd-page">
        <Header />
        <div className="container rd-body" style={{ justifyContent: "center", padding: "80px 0" }}>
          <p>Không tìm thấy loại phòng.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="rd-page">
      <Header />

      <div className="rd-back-bar">
        <div className="container">
          <button className="rd-back-btn" onClick={() => navigate("/rooms")}>
            <LeftOutlined /> Quay lại danh sách
          </button>
        </div>
      </div>

      <div className="container rd-body">
        <div className="rd-left">
          <div className="rd-img-grid">
            {images.length > 0 ? (
              <>
                <div className="rd-img-main">
                  <img
                    src={images[activeImg]?.imageUrl}
                    alt={images[activeImg]?.altText || roomType.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                  />
                </div>
                {images.slice(1, 5).map((img: any, idx: number) => (
                  <div
                    key={img.id}
                    className="rd-img-sub"
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveImg(idx + 1)}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.altText || roomType.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                    />
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 4 - (images.length - 1)) }).map((_, i) => (
                  <div key={`ph-${i}`} className="rd-img-sub rd-img-placeholder">
                    <PictureOutlined />
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="rd-img-main rd-img-placeholder"><HomeOutlined /></div>
                {[0,1,2,3].map(i => (
                  <div key={i} className="rd-img-sub rd-img-placeholder"><PictureOutlined /></div>
                ))}
              </>
            )}
          </div>

          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {images.map((img: any, idx: number) => (
                <img
                  key={img.id}
                  src={img.imageUrl}
                  alt={img.altText || `Ảnh ${idx + 1}`}
                  onClick={() => setActiveImg(idx)}
                  style={{
                    width: 56,
                    height: 56,
                    objectFit: "cover",
                    borderRadius: 6,
                    cursor: "pointer",
                    border: activeImg === idx ? "2px solid #6366f1" : "2px solid transparent",
                  }}
                />
              ))}
            </div>
          )}

          <div className="rd-info-card">
            <div className="rd-info-top">
              <div>
                <span className="rd-type-badge">{roomType.name}</span>
                <span className="rd-popular-badge">
                  <FireOutlined /> {roomType.capacity}
                </span>
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

            <h1 className="rd-name">{roomType.name}</h1>

            <div className="rd-rating-row">
              {[1,2,3,4,5].map((i) => (
                <StarFilled key={i} className="rd-star filled" />
              ))}
              <span className="rd-rating-num">5.0</span>
              <span className="rd-reviews">({reviews.length} đánh giá)</span>
            </div>

            <div className="rd-tabs">
              <button
                className={`rd-tab${tab === "info" ? " active" : ""}`}
                onClick={() => setTab("info")}
              >Thông tin</button>
              <button
                className={`rd-tab${tab === "reviews" ? " active" : ""}`}
                onClick={() => setTab("reviews")}
              >Đánh giá ({reviews.length})</button>
            </div>

            {tab === "info" ? (
              <>
                <p className="rd-desc">{roomType.description}</p>

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
                {reviews.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 30, color: "#64748b" }}>Chưa có đánh giá nào.</div>
                ) : reviews.map((c, i) => (
                  <div key={c.evaluationId ?? c.id ?? i} className="rd-review-item">
                    <div className="rd-review-avatar" style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "#3b82f6", display: "flex", alignItems: "center",
                      justifyContent: "center", color: "#fff", flexShrink: 0,
                    }}>
                      {(c.userName ?? c.author ?? "K")[0].toUpperCase()}
                    </div>
                    <div className="rd-review-content">
                      <div className="rd-review-name">{c.userName ?? c.author ?? "Khách hàng"}</div>
                      <div className="rd-review-stars">
                        {[1,2,3,4,5].map((i) => (
                          <StarFilled key={i} className={i <= (c.rating ?? 5) ? "rd-star filled" : "rd-star"} style={{ fontSize: 12 }} />
                        ))}
                        <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4 }}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString("vi-VN") : ""}
                        </span>
                      </div>
                      <p className="rd-review-text">{c.comment ?? c.text ?? ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="rd-booking-card">
          <div className="rd-price-block">
            <span className="rd-price">Liên hệ</span>
            <span className="rd-price-unit"> /đêm</span>
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
              <select
                className="rd-form-input"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              >
                {[1,2,3,4].map((n) => (
                  <option key={n} value={n}>{n} khách</option>
                ))}
              </select>
            </div>

            {nights > 0 && (
              <div className="rd-price-calc">
                <div className="rd-calc-row">
                  <span>{nights} đêm</span>
                </div>
              </div>
            )}

            <button
              className="rd-book-btn"
              onClick={() => {
                if (!isLoggedIn()) {
                  navigate("/");
                  return;
                }
                const params = new URLSearchParams({
                  roomTypeId: String(roomTypeId ?? ""),
                  checkIn:    checkIn,
                  checkOut:   checkOut,
                  guests:     String(guests),
                });
                navigate(`/booking?${params.toString()}`);
              }}
            >
              Đặt phòng ngay
            </button>
            <p className="rd-book-note">Chưa bị trừ tiền — xác nhận sau</p>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
