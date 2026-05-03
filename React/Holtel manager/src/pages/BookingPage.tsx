import { useState, useEffect } from "react";
import {
  CalendarOutlined, UserOutlined, CheckCircleOutlined,
  LoadingOutlined, LeftOutlined, HomeOutlined,
} from "@ant-design/icons";
import Header from "../shared/Header";
import Footer from "../shared/Fooder";
import { navigate } from "../Approuter";
import { apiSearchRoomType } from "../services/RoomTypeService";
import { apiCreateBooking } from "../services/BookingService";
import { getUser, isLoggedIn } from "../constant/api";
import "../assets/css/Checkout/BookingPage.css";

interface BookingPageProps {
  roomTypeId?: number;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export default function BookingPage({ roomTypeId, checkIn = "", checkOut = "", guests = 1 }: BookingPageProps) {
  const [roomType,   setRoomType]   = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");
  const [ciDate,     setCiDate]     = useState(checkIn);
  const [coDate,     setCoDate]     = useState(checkOut);
  const [guestNum,   setGuestNum]   = useState(guests);
  const [note,       setNote]       = useState("");

  const today = new Date().toISOString().split("T")[0];
  const user  = getUser();

  const nights = ciDate && coDate
    ? Math.max(0, Math.round((new Date(coDate).getTime() - new Date(ciDate).getTime()) / 86400000))
    : 0;

  const pricePerNight = roomType?.roomRates?.[0]?.price ?? roomType?.basePrice ?? 0;
  const totalEstimate = nights * pricePerNight;

  useEffect(() => {
    if (!roomTypeId) { setLoading(false); return; }
    apiSearchRoomType(1, 100)
      .then((res) => {
        const found = (res?.data ?? []).find((r: any) => (r.roomTypeId ?? r.id) === roomTypeId);
        setRoomType(found ?? null);
      })
      .catch(() => setRoomType(null))
      .finally(() => setLoading(false));
  }, [roomTypeId]);

  const handleSubmit = async () => {
    if (!isLoggedIn()) { navigate("/"); return; }
    if (!ciDate || !coDate) { setError("Vui lòng chọn ngày nhận và trả phòng."); return; }
    if (nights <= 0) { setError("Ngày trả phòng phải sau ngày nhận phòng."); return; }
    if (!roomTypeId) { setError("Không tìm thấy loại phòng."); return; }
    if (roomType && (roomType.availableRooms ?? 0) <= 0) {
      setError("Loại phòng này hiện không còn phòng trống. Vui lòng chọn loại phòng khác.");
      return;
    }

    setSubmitting(true); setError("");
    try {
      const token = localStorage.getItem("hotel_token") ?? "";
      let userId = "";
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload?.sub ?? payload?.nameid ?? payload?.userId ?? "";
      } catch { /* ignore */ }

      await apiCreateBooking({
        userId:     userId,
        roomTypeId: roomTypeId,
        fromDate:   ciDate,   // đã validate !== '' ở trên
        toDate:     coDate,
        status:     "Pending",
        createdAt:  new Date().toISOString(),
      });

      setSuccess(true);
    } catch (e: any) {
      setError(e?.message ?? "Đặt phòng thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <><Header />
    <div className="bk-loading"><LoadingOutlined style={{ fontSize: 36 }} /></div>
    <Footer /></>
  );

  if (success) return (
    <><Header />
    <div className="bk-success-wrap">
      <div className="bk-success-card">
        <div className="bk-success-icon"><CheckCircleOutlined /></div>
        <h2 className="bk-success-title">Đặt phòng thành công!</h2>
        <p className="bk-success-sub">
          Yêu cầu đặt phòng của bạn đã được ghi nhận với trạng thái <strong>Chờ xác nhận</strong>.
          Nhân viên sẽ liên hệ xác nhận và thông báo thông tin phòng trong vòng 24 giờ.
        </p>
        <div className="bk-success-info">
          <div><span>Loại phòng</span><strong>{roomType?.name ?? `#${roomTypeId}`}</strong></div>
          <div><span>Nhận phòng</span><strong>{ciDate}</strong></div>
          <div><span>Trả phòng</span><strong>{coDate}</strong></div>
          <div><span>Số đêm</span><strong>{nights} đêm</strong></div>
          <div><span>Số khách</span><strong>{guestNum} khách</strong></div>
          {totalEstimate > 0 && (
            <div><span>Ước tính</span><strong>{totalEstimate.toLocaleString("vi-VN")}₫</strong></div>
          )}
          <div><span>Trạng thái</span><strong style={{ color: "#eab308" }}>Chờ xác nhận</strong></div>
        </div>
        <div className="bk-success-note">
          Việc thanh toán sẽ được thực hiện tại khách sạn hoặc theo hướng dẫn của nhân viên.
        </div>
        <div className="bk-success-actions">
          <button className="bk-btn-home" onClick={() => navigate("/")}>
            <HomeOutlined /> Về trang chủ
          </button>
          <button className="bk-btn-history" onClick={() => navigate("/booking-history")}>
            Xem lịch sử đặt phòng
          </button>
        </div>
      </div>
    </div>
    <Footer /></>
  );

  return (
    <><Header />
    <div className="bk-page">
      <div className="container bk-container">
        <button className="bk-back" onClick={() => window.history.back()}>
          <LeftOutlined /> Quay lại
        </button>
        <h1 className="bk-title">Đặt phòng</h1>

        <div className="bk-layout">
          {/* ── LEFT: Form ── */}
          <div className="bk-left">
            <div className="bk-section">
              <h3 className="bk-section-title"><CalendarOutlined /> Thông tin lưu trú</h3>
              <div className="bk-date-row">
                <div className="bk-field">
                  <label>Ngày nhận phòng</label>
                  <input type="date" className="bk-input" min={today}
                    value={ciDate} onChange={e => setCiDate(e.target.value)} />
                </div>
                <div className="bk-field">
                  <label>Ngày trả phòng</label>
                  <input type="date" className="bk-input" min={ciDate || today}
                    value={coDate} onChange={e => setCoDate(e.target.value)} />
                </div>
              </div>
              <div className="bk-field">
                <label><UserOutlined /> Số khách</label>
                <select className="bk-input" value={guestNum}
                  onChange={e => setGuestNum(Number(e.target.value))}>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} khách</option>)}
                </select>
              </div>
            </div>

            <div className="bk-section">
              <h3 className="bk-section-title"><UserOutlined /> Thông tin khách hàng</h3>
              <div className="bk-info-rows">
                <div><span>Tên tài khoản</span><strong>{user?.userName ?? "–"}</strong></div>
                <div><span>Email</span><strong>{user?.email ?? "–"}</strong></div>
              </div>
            </div>

            <div className="bk-section">
              <h3 className="bk-section-title">Ghi chú</h3>
              <textarea className="bk-textarea" rows={3} value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Yêu cầu đặc biệt (tầng cao, giường đôi, phòng yên tĩnh...)" />
            </div>

            <div className="bk-payment-note">
              <span>💡</span>
              <span>
                <strong>Lưu ý về thanh toán:</strong> Bạn chưa cần thanh toán ngay.
                Nhân viên khách sạn sẽ xử lý thanh toán khi bạn nhận phòng hoặc liên hệ trực tiếp với bạn.
              </span>
            </div>
          </div>

          {/* ── RIGHT: Summary ── */}
          <div className="bk-right">
            <div className="bk-summary">
              <h3 className="bk-summary-title">Tóm tắt đặt phòng</h3>

              {roomType ? (
                <>
                  {roomType.images?.[0]?.imageUrl && (
                    <img src={roomType.images[0].imageUrl} alt={roomType.name}
                      className="bk-summary-img" />
                  )}
                  <div className="bk-summary-name">{roomType.name}</div>
                  {roomType.capacity && (
                    <div className="bk-summary-capacity">{roomType.capacity}</div>
                  )}
                </>
              ) : (
                <div className="bk-summary-name">Loại phòng #{roomTypeId}</div>
              )}

              <div className="bk-summary-rows">
                <div><span>Nhận phòng</span><strong>{ciDate || "–"}</strong></div>
                <div><span>Trả phòng</span><strong>{coDate || "–"}</strong></div>
                <div><span>Số đêm</span><strong>{nights > 0 ? `${nights} đêm` : "–"}</strong></div>
                <div><span>Số khách</span><strong>{guestNum} khách</strong></div>
                {pricePerNight > 0 && (
                  <div><span>Giá tham khảo/đêm</span><strong>{pricePerNight.toLocaleString("vi-VN")}₫</strong></div>
                )}
              </div>

              {totalEstimate > 0 && (
                <div className="bk-summary-total">
                  <span>Ước tính</span>
                  <strong>{totalEstimate.toLocaleString("vi-VN")}₫</strong>
                </div>
              )}

              <div className="bk-status-badge">Trạng thái sau đặt: <strong>Chờ xác nhận</strong></div>

              {/* Hiển thị số phòng trống */}
              {roomType && (
                <div className={`bk-avail-badge ${(roomType.availableRooms ?? 0) > 0 ? 'ok' : 'none'}`}>
                  {(roomType.availableRooms ?? 0) > 0
                    ? <>✓ Còn <strong>{roomType.availableRooms}</strong> phòng trống</>
                    : <>✗ Hết phòng trống — vui lòng chọn loại phòng khác</>}
                </div>
              )}

              {error && <div className="bk-error">{error}</div>}

              <button className="bk-submit" onClick={handleSubmit}
                disabled={submitting || (roomType && (roomType.availableRooms ?? 0) <= 0)}>
                {submitting
                  ? <><LoadingOutlined style={{ marginRight: 8 }} />Đang gửi...</>
                  : <><CheckCircleOutlined style={{ marginRight: 8 }} />Xác nhận đặt phòng</>}
              </button>

              <p className="bk-note">Chưa thanh toán — nhân viên sẽ liên hệ xác nhận.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer /></>
  );
}
