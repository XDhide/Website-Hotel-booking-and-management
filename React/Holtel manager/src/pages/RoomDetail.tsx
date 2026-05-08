import { useState, useEffect } from "react";
import { isLoggedIn } from "../constant/api";
import { apiGetRoomRateByRoomType } from "../services/RoomRateService";
import { apiCreateBooking } from "../services/BookingService";
import {
  LeftOutlined,
  StarFilled,
  HeartOutlined,
  HeartFilled,
  HomeOutlined,
  PictureOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { apiGetReviews } from "../services/ReviewService";
import { navigate } from "../Approuter.tsx";
import Header from "../shared/Header";
import Footer from "../shared/Fooder";
import { apiGetRoomTypeById } from "../services/RoomTypeService";
import "../assets/css/RoomDetail/RoomDetail.css";

interface RoomRate {
  roomRateId: number;
  rentType: string;
  price: number;
  isActive: boolean;
}
interface Props {
  roomTypeId?: number;
}

const RENT_LABEL: Record<string, string> = {
  Night: "Theo đêm",
  Day: "Theo ngày",
  Hour: "Theo giờ",
  Weekend: "Cuối tuần",
  Holiday: "Ngày lễ",
  Weekday: "Ngày thường",
};
const RENT_UNIT: Record<string, string> = {
  Night: "/đêm",
  Day: "/ngày",
  Hour: "/giờ",
  Weekend: "/cuối tuần",
  Holiday: "/ngày lễ",
  Weekday: "/ngày thường",
};
const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v ?? 0,
  );

export default function RoomDetail({ roomTypeId }: Props) {
  const [roomType, setRoomType] = useState<any>(null);
  const [rates, setRates] = useState<RoomRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [tab, setTab] = useState<"info" | "reviews">("info");
  const [showBooking, setShowBooking] = useState(false);
  const [rentType, setRentType] = useState<"Day" | "Hour">("Day");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromHour, setFromHour] = useState("");
  const [toHour, setToHour] = useState("");
  const [guests, setGuests] = useState(1);
  const [booking, setBooking] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);
  const [bookingErr, setBookingErr] = useState("");
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
    Promise.all([
      apiGetRoomTypeById(roomTypeId),
      apiGetRoomRateByRoomType(roomTypeId),
    ])
      .then(([rt, rr]) => {
        setRoomType(rt);
        const activeRates = Array.isArray(rr)
          ? rr.filter((r: RoomRate) => r.isActive !== false)
          : [];
        setRates(activeRates);
      })
      .finally(() => setLoading(false));
  }, [roomTypeId]);

  const images: any[] = roomType?.images ?? [];
  const dayRate =
    rates.find((r) => r.rentType === "Day") ??
    rates.find((r) => r.rentType === "Night");
  const hourRate = rates.find((r) => r.rentType === "Hour");
  const selectedRate =
    rates.find((r) => r.rentType === rentType) ??
    (rentType === "Day" ? dayRate : hourRate);

  const calcEstimate = () => {
    if (!selectedRate) return 0;
    if (rentType === "Day") {
      if (!fromDate || !toDate) return 0;
      const days = Math.max(
        0,
        Math.ceil(
          (new Date(toDate).getTime() - new Date(fromDate).getTime()) /
          86400000,
        ),
      );
      return days * selectedRate.price;
    } else {
      if (!fromHour || !toHour) return 0;
      const [fh, fm] = fromHour.split(":").map(Number);
      const [th, tm] = toHour.split(":").map(Number);
      const hours = Math.max(0, (th * 60 + tm - fh * 60 - fm) / 60);
      return Math.ceil(hours) * selectedRate.price;
    }
  };
  const estimate = calcEstimate();

  const handleBook = async () => {
    if (!isLoggedIn()) {
      navigate("/");
      return;
    }
    setBookingErr("");
    if (rentType === "Day") {
      if (!fromDate || !toDate) {
        setBookingErr("Vui lòng chọn ngày nhận và trả phòng.");
        return;
      }
      if (new Date(toDate) <= new Date(fromDate)) {
        setBookingErr("Ngày trả phòng phải sau ngày nhận phòng.");
        return;
      }
    } else {
      if (!fromDate || !fromHour || !toHour) {
        setBookingErr("Vui lòng điền đầy đủ thông tin giờ thuê.");
        return;
      }
      if (fromHour >= toHour) {
        setBookingErr("Giờ trả phòng phải sau giờ nhận phòng.");
        return;
      }
    }
    setBooking(true);
    try {
      const token = localStorage.getItem("hotel_token") ?? "";
      let userId = "";
      try {
        const p = JSON.parse(atob(token.split(".")[1]));
        userId = p?.sub ?? p?.nameid ?? "";
      } catch { }
      let ciDateTime = fromDate,
        coDateTime = toDate;
      if (rentType === "Hour") {
        ciDateTime = `${fromDate}T${fromHour}:00`;
        coDateTime = `${fromDate}T${toHour}:00`;
      }
      await apiCreateBooking({
        userId,
        roomTypeId,
        fromDate: ciDateTime,
        toDate: coDateTime,
        status: "Pending",
        rentType,
        createdAt: new Date().toISOString(),
      });
      setBookingDone(true);
    } catch (e: any) {
      setBookingErr(e?.response?.data ?? e?.message ?? "Đặt phòng thất bại.");
    } finally {
      setBooking(false);
    }
  };

  const resetBooking = () => {
    setShowBooking(false);
    setBookingDone(false);
    setBookingErr("");
    setFromDate("");
    setToDate("");
    setFromHour("");
    setToHour("");
    setRentType("Day");
  };

  if (loading)
    return (
      <div className="rd-page">
        <Header />
        <div className="container rd-body rd-flex-center rd-py-80">
          <LoadingOutlined className="rd-loading-icon-large" />
        </div>
        <Footer />
      </div>
    );
  if (!roomType)
    return (
      <div className="rd-page">
        <Header />
        <div className="container rd-body rd-flex-center rd-py-80">
          <p>Không tìm thấy loại phòng.</p>
        </div>
        <Footer />
      </div>
    );

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
                    alt={roomType.name}
                    className="rd-w-full rd-h-full rd-object-cover rd-rounded-8"
                  />
                </div>
                {images.slice(1, 5).map((img: any, idx: number) => (
                  <div
                    key={img.id}
                    className="rd-img-sub rd-cursor-pointer"
                    onClick={() => setActiveImg(idx + 1)}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.altText || roomType.name}
                      className="rd-w-full rd-h-full rd-object-cover rd-rounded-8"
                    />
                  </div>
                ))}
                {Array.from({
                  length: Math.max(0, 4 - (images.length - 1)),
                }).map((_, i) => (
                  <div
                    key={`ph-${i}`}
                    className="rd-img-sub rd-img-placeholder"
                  >
                    <PictureOutlined />
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="rd-img-main rd-img-placeholder">
                  <HomeOutlined />
                </div>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="rd-img-sub rd-img-placeholder">
                    <PictureOutlined />
                  </div>
                ))}
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="rd-flex-wrap rd-gap-8 rd-mt-8 rd-flex">
              {images.map((img: any, idx: number) => (
                <img
                  key={img.id}
                  src={img.imageUrl}
                  alt={`Ảnh ${idx + 1}`}
                  onClick={() => setActiveImg(idx)}
                  className={`rd-thumb ${activeImg === idx ? "active" : "inactive"}`}
                />
              ))}
            </div>
          )}

          <div className="rd-info-card">
            <div className="rd-info-top">
              <div>
                <span className="rd-type-badge">{roomType.name}</span>
                {roomType.capacity && (
                  <span className="rd-popular-badge">
                    <FireOutlined /> {roomType.capacity}
                  </span>
                )}
              </div>
              <button
                className="rd-action-btn"
                onClick={() => setLiked((p) => !p)}
              >
                {liked ? (
                  <HeartFilled className="rd-heart-liked" />
                ) : (
                  <HeartOutlined />
                )}
              </button>
            </div>
            <h1 className="rd-name">{roomType.name}</h1>
            <div className="rd-rating-row">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarFilled key={i} className="rd-star filled" />
              ))}
              <span className="rd-rating-num">5.0</span>
              <span className="rd-reviews">({reviews.length} đánh giá)</span>
            </div>

            { }
            {rates.length > 0 && (
              <div className="rd-mb-16">
                <h3 className="rd-section-title">Bảng giá</h3>
                <div className="rd-rates-grid">
                  {rates.map((r) => (
                    <div key={r.roomRateId} className="rd-rate-card">
                      <div className="rd-rate-type">
                        {RENT_LABEL[r.rentType] ?? r.rentType}
                      </div>
                      <div className="rd-rate-price">{fmt(r.price)}</div>
                      <div className="rd-rate-unit">
                        {RENT_UNIT[r.rentType] ?? ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rd-tabs">
              <button
                className={`rd-tab${tab === "info" ? " active" : ""}`}
                onClick={() => setTab("info")}
              >
                Thông tin
              </button>
              <button
                className={`rd-tab${tab === "reviews" ? " active" : ""}`}
                onClick={() => setTab("reviews")}
              >
                Đánh giá ({reviews.length})
              </button>
            </div>

            {tab === "info" ? (
              <>
                {roomType.description && (
                  <p className="rd-desc">{roomType.description}</p>
                )}
                {roomType.capacity && (
                  <div className="rd-capacity-info">
                    <UserOutlined /> Sức chứa: {roomType.capacity} khách
                  </div>
                )}
              </>
            ) : (
              <div className="rd-reviews-list">
                {reviews.length === 0 ? (
                  <div className="rd-no-reviews">Chưa có đánh giá nào.</div>
                ) : (
                  reviews.map((c, i) => (
                    <div
                      key={c.evaluationId ?? c.id ?? i}
                      className="rd-review-item"
                    >
                      <div className="rd-review-avatar-wrap">
                        {(c.userName ?? c.author ?? "K")[0].toUpperCase()}
                      </div>
                      <div className="rd-review-content">
                        <div className="rd-review-name">
                          {c.userName ?? c.author ?? "Khách hàng"}
                        </div>
                        <div className="rd-review-stars">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <StarFilled
                              key={n}
                              style={{
                                fontSize: 12,
                                color:
                                  n <= (c.rating ?? 5) ? "#f59e0b" : "#e2e8f0",
                              }}
                            />
                          ))}
                          <span className="rd-review-date">
                            {c.createdAt
                              ? new Date(c.createdAt).toLocaleDateString(
                                "vi-VN",
                              )
                              : ""}
                          </span>
                        </div>
                        <p className="rd-review-text">
                          {c.comment ?? c.text ?? ""}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        { }
        <aside className="rd-booking-card">
          <div className="rd-price-block">
            {dayRate ? (
              <>
                <span className="rd-price">{fmt(dayRate.price)}</span>
                <span className="rd-price-unit">
                  {RENT_UNIT[dayRate.rentType] ?? ""}
                </span>
              </>
            ) : (
              <span className="rd-price rd-price-contact">
                Liên hệ để biết giá
              </span>
            )}
          </div>
          {rates.length > 0 && (
            <div className="rd-rate-list">
              {rates.map((r) => (
                <div key={r.roomRateId} className="rd-rate-list-item">
                  <span className="rd-rate-list-label">
                    {RENT_LABEL[r.rentType] ?? r.rentType}
                  </span>
                  <span className="rd-rate-list-val">{fmt(r.price)}</span>
                </div>
              ))}
            </div>
          )}
          <div
            className={`rd-avail-status ${(roomType.availableRooms ?? 0) > 0 ? "available" : "unavailable"}`}
          >
            {(roomType.availableRooms ?? 0) > 0 ? (
              <>
                ✓ Còn <strong>{roomType.availableRooms}</strong> phòng trống
              </>
            ) : (
              <>✗ Hết phòng trống</>
            )}
          </div>
          <button
            className={`rd-book-btn ${(roomType.availableRooms ?? 0) <= 0 ? "disabled" : ""}`}
            disabled={(roomType.availableRooms ?? 0) <= 0}
            onClick={() => {
              if (!isLoggedIn()) {
                navigate("/");
                return;
              }
              navigate(`/checkout/${roomTypeId}`);
            }}
          >
            {(roomType.availableRooms ?? 0) <= 0
              ? "Hết phòng"
              : "Đặt phòng ngay"}
          </button>
          <p className="rd-book-note">
            Admin sẽ xác nhận và làm thủ tục check-in
          </p>
        </aside>
      </div>

      { }
      {showBooking && (
        <div
          className="rd-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget && !booking) resetBooking();
          }}
        >
          <div className="rd-modal-content">
            {bookingDone ? (
              <div className="rd-success-wrap">
                <CheckCircleOutlined className="rd-success-icon" />
                <h3 className="rd-success-title">Đặt phòng thành công!</h3>
                <p className="rd-success-desc">
                  Yêu cầu đã gửi. Admin sẽ xác nhận và thực hiện check-in cho
                  bạn.
                </p>
                <div className="rd-success-actions">
                  <button onClick={resetBooking} className="rd-btn-close-modal">
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      resetBooking();
                      navigate("/booking-history");
                    }}
                    className="rd-btn-history"
                  >
                    Xem lịch sử đặt
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="rd-modal-header">
                  <h3 className="rd-modal-title">
                    Đặt phòng — {roomType.name}
                  </h3>
                  <button onClick={resetBooking} className="rd-modal-close-btn">
                    ✕
                  </button>
                </div>

                { }
                <div className="rd-rent-type-wrap">
                  {(dayRate ||
                    rates.some((r) =>
                      ["Day", "Night"].includes(r.rentType),
                    )) && (
                      <button
                        onClick={() => setRentType("Day")}
                        className={`rd-rent-type-btn ${rentType === "Day" ? "day" : "day-inactive"}`}
                      >
                        <CalendarOutlined className="rd-mr-6" />
                        Theo ngày
                      </button>
                    )}
                  {hourRate && (
                    <button
                      onClick={() => setRentType("Hour")}
                      className={`rd-rent-type-btn ${rentType === "Hour" ? "hour" : "hour-inactive"}`}
                    >
                      <ClockCircleOutlined className="rd-mr-6" />
                      Theo giờ
                    </button>
                  )}
                </div>

                {rentType === "Day" ? (
                  <div className="rd-form-grid">
                    {[
                      {
                        label: "Ngày nhận phòng",
                        val: fromDate,
                        set: setFromDate,
                        min: today,
                      },
                      {
                        label: "Ngày trả phòng",
                        val: toDate,
                        set: setToDate,
                        min: fromDate || today,
                      },
                    ].map(({ label, val, set, min }) => (
                      <div key={label}>
                        <label className="rd-input-label">{label}</label>
                        <input
                          type="date"
                          value={val}
                          min={min}
                          onChange={(e) => set(e.target.value)}
                          className="rd-modal-input"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="rd-mb-12">
                      <label className="rd-input-label">Ngày thuê</label>
                      <input
                        type="date"
                        value={fromDate}
                        min={today}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="rd-modal-input"
                      />
                    </div>
                    <div className="rd-form-grid">
                      {[
                        {
                          label: "Giờ nhận phòng",
                          val: fromHour,
                          set: setFromHour,
                        },
                        { label: "Giờ trả phòng", val: toHour, set: setToHour },
                      ].map(({ label, val, set }) => (
                        <div key={label}>
                          <label className="rd-input-label">{label}</label>
                          <input
                            type="time"
                            value={val}
                            onChange={(e) => set(e.target.value)}
                            className="rd-modal-input"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="rd-mb-14">
                  <label className="rd-input-label">Số khách</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="rd-modal-select"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} khách
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRate && estimate > 0 && (
                  <div className="rd-estimate-box">
                    <div className="rd-estimate-row rd-estimate-unit">
                      <span>Đơn giá ({RENT_LABEL[selectedRate.rentType]})</span>
                      <span>{fmt(selectedRate.price)}</span>
                    </div>
                    <div className="rd-estimate-row rd-estimate-total">
                      <span>Dự tính</span>
                      <span>{fmt(estimate)}</span>
                    </div>
                    <div className="rd-estimate-note">
                      * Giá thực tế xác nhận khi check-in
                    </div>
                  </div>
                )}

                {bookingErr && <div className="rd-err-msg">{bookingErr}</div>}

                <button
                  onClick={handleBook}
                  disabled={booking}
                  className={`rd-submit-btn ${booking ? "disabled" : "active"}`}
                >
                  {booking ? (
                    <>
                      <LoadingOutlined className="rd-mr-6" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Xác nhận đặt phòng"
                  )}
                </button>
                <p className="rd-submit-note">
                  Admin sẽ xác nhận và làm thủ tục check-in cho bạn
                </p>
              </>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
