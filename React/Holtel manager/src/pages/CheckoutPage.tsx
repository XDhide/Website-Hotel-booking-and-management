import { useState, useEffect } from "react";
import {
  LeftOutlined, CalendarOutlined, ClockCircleOutlined,
  CheckCircleOutlined, LoadingOutlined, DollarOutlined,
  CreditCardOutlined, SafetyOutlined, UserOutlined, BankOutlined,
} from "@ant-design/icons";
import { navigate } from "../Approuter";
import Header from "../shared/Header";
import Footer from "../shared/Fooder";
import { isLoggedIn, apiClient } from "../constant/api";
import { API } from "../constant/config";
import { apiGetRoomTypeById } from "../services/RoomTypeService";
import "../assets/css/Checkout/BookingPage.css";

interface RoomRate { roomRateId: number; rentType: string; price: number; isActive: boolean; }

const RENT_LABEL: Record<string, string> = {
  Night: "Theo đêm", Day: "Theo ngày", Hour: "Theo giờ",
  Weekend: "Cuối tuần", Holiday: "Ngày lễ", Weekday: "Ngày thường",
};
const RENT_UNIT: Record<string, string> = {
  Night: "/đêm", Day: "/ngày", Hour: "/giờ",
  Weekend: "/cuối tuần", Holiday: "/ngày lễ", Weekday: "/ngày thường",
};

const fmt = (v?: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v ?? 0);

const fmtDate = (s?: string) => {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

type Step = "select" | "payment" | "done";

interface Props { roomTypeId?: number; }

export default function CheckoutPage({ roomTypeId }: Props) {
  const [roomType, setRoomType] = useState<any>(null);
  const [rates, setRates]       = useState<RoomRate[]>([]);
  const [loading, setLoading]   = useState(true);

  
  const [rentType, setRentType] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate]     = useState("");
  const [fromHour, setFromHour] = useState("");
  const [toHour, setToHour]     = useState("");
  const [guests, setGuests]     = useState(1);

  
  const [estimate, setEstimate]   = useState(0);
  const [deposit, setDeposit]     = useState(0);
  const [units, setUnits]         = useState(0);

  
  const [step, setStep]         = useState<Step>("select");
  const [payMethod, setPayMethod] = useState<"bank" | "card">("bank");
  const [paying, setPaying]     = useState(false);
  const [booking, setBooking]   = useState(false);
  const [error, setError]       = useState("");
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!isLoggedIn()) { navigate("/"); return; }
    if (!roomTypeId) { setLoading(false); return; }
    Promise.all([
      apiGetRoomTypeById(roomTypeId),
      apiClient.get(`${API}/roomrate/by-roomtype/${roomTypeId}`).then(r => r.data).catch(() => []),
    ]).then(([rt, rr]) => {
      setRoomType(rt);
      const active: RoomRate[] = Array.isArray(rr) ? rr.filter((r: RoomRate) => r.isActive !== false) : [];
      setRates(active);
      
      if (active.length > 0) setRentType(active[0].rentType);
    }).finally(() => setLoading(false));
  }, [roomTypeId]);

  
  useEffect(() => {
    const rate = rates.find(r => r.rentType === rentType);
    if (!rate) { setEstimate(0); setDeposit(0); setUnits(0); return; }

    let u = 0;
    if (rentType === "Hour") {
      if (fromDate && fromHour && toHour) {
        const [fh, fm] = fromHour.split(":").map(Number);
        const [th, tm] = toHour.split(":").map(Number);
        u = Math.max(0, Math.ceil((th * 60 + tm - fh * 60 - fm) / 60));
      }
    } else {
      if (fromDate && toDate) {
        const diff = (new Date(toDate).getTime() - new Date(fromDate).getTime()) / 86400000;
        u = Math.max(0, Math.ceil(diff));
      }
    }
    const est = u * rate.price;
    setUnits(u);
    setEstimate(est);
    setDeposit(Math.round(est * 0.2));
  }, [rentType, fromDate, toDate, fromHour, toHour, rates]);

  const selectedRate = rates.find(r => r.rentType === rentType);

  const validateForm = (): string => {
    if (!rentType) return "Vui lòng chọn loại thuê phòng.";
    if (!fromDate) return "Vui lòng chọn ngày nhận phòng.";
    if (rentType === "Hour") {
      if (!fromHour || !toHour) return "Vui lòng chọn giờ nhận và trả phòng.";
      if (fromHour >= toHour) return "Giờ trả phòng phải sau giờ nhận phòng.";
    } else {
      if (!toDate) return "Vui lòng chọn ngày trả phòng.";
      if (new Date(toDate) <= new Date(fromDate)) return "Ngày trả phòng phải sau ngày nhận phòng.";
    }
    if (estimate <= 0) return "Không tính được giá. Vui lòng kiểm tra lại thời gian.";
    return "";
  };

  const handleProceedToPayment = () => {
    const err = validateForm();
    if (err) { setError(err); return; }
    setError("");
    setStep("payment");
  };

  const handlePay = async () => {
    setPaying(true);
    setError("");
    
    await new Promise(r => setTimeout(r, 2000));
    setPaying(false);
    
    await handleCreateBooking();
  };

  const handleCreateBooking = async () => {
    setBooking(true);
    setError("");
    try {
      let fromDateTime = fromDate;
      let toDateTime = toDate;
      if (rentType === "Hour") {
        fromDateTime = `${fromDate}T${fromHour}:00`;
        toDateTime   = `${fromDate}T${toHour}:00`;
      } else {
        fromDateTime = `${fromDate}T14:00:00`; 
        toDateTime   = `${toDate}T12:00:00`;   
      }

      const res = await apiClient.post(`${API}/booking`, {
        roomTypeId,
        fromDate: fromDateTime,
        toDate: toDateTime,
        rentType,
        estimatedTotal: estimate,
        deposit,
        status: "Pending",
      });

      const bookingId = res.data?.id ?? res.data?.Id ?? res.data?.data?.id;
      setCreatedBookingId(bookingId);
      setStep("done");
    } catch (e: any) {
      const msg = e?.response?.data?.message
        ?? e?.response?.data
        ?? e?.message
        ?? "Đặt phòng thất bại. Vui lòng thử lại.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      setStep("payment");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="bp-page"><Header />
      <div style={{ textAlign: "center", padding: 80 }}><LoadingOutlined style={{ fontSize: 36 }} /></div>
      <Footer />
    </div>
  );

  if (!roomType) return (
    <div className="bp-page"><Header />
      <div style={{ textAlign: "center", padding: 80, color: "#64748b" }}>Không tìm thấy loại phòng.</div>
      <Footer />
    </div>
  );

  return (
    <div className="bp-page">
      <Header />

      {}
      <div className="bp-back-bar">
        <div className="container">
          <button className="bp-back-btn" onClick={() => navigate(`/rooms/${roomTypeId}`)}>
            <LeftOutlined /> Quay lại chi tiết phòng
          </button>
        </div>
      </div>

      <div className="container bp-body">
        {}
        <div className="bp-steps">
          {[
            { key: "select",  label: "Chọn thời gian" },
            { key: "payment", label: "Thanh toán cọc" },
            { key: "done",    label: "Hoàn tất" },
          ].map((s, i) => (
            <div key={s.key} className={`bp-step ${step === s.key ? "active" : ""} ${
              (step === "payment" && i === 0) || (step === "done" && i <= 1) ? "done" : ""
            }`}>
              <div className="bp-step-num">{i + 1}</div>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="bp-content">
          {}
          <div className="bp-main">

            {}
            {step === "select" && (
              <div className="bp-card">
                <h2 className="bp-card-title"><CalendarOutlined /> Thông tin lưu trú</h2>

                {}
                <div className="bp-field">
                  <label className="bp-label">Loại thuê phòng</label>
                  <div className="bp-rent-tabs">
                    {rates.map(r => (
                      <button
                        key={r.roomRateId}
                        className={`bp-rent-tab ${rentType === r.rentType ? "active" : ""}`}
                        onClick={() => { setRentType(r.rentType); setFromDate(""); setToDate(""); setFromHour(""); setToHour(""); }}
                      >
                        {r.rentType === "Hour"
                          ? <><ClockCircleOutlined /> Theo giờ</>
                          : <><CalendarOutlined /> {RENT_LABEL[r.rentType] ?? r.rentType}</>
                        }
                        <span className="bp-rent-price">{fmt(r.price)}{RENT_UNIT[r.rentType] ?? ""}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {}
                {rentType !== "Hour" ? (
                  <div className="bp-date-row">
                    <div className="bp-field">
                      <label className="bp-label">Ngày nhận phòng</label>
                      <input type="date" className="bp-input" value={fromDate} min={today}
                        onChange={e => setFromDate(e.target.value)} />
                    </div>
                    <div className="bp-field">
                      <label className="bp-label">Ngày trả phòng</label>
                      <input type="date" className="bp-input" value={toDate} min={fromDate || today}
                        onChange={e => setToDate(e.target.value)} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bp-field">
                      <label className="bp-label">Ngày thuê</label>
                      <input type="date" className="bp-input" value={fromDate} min={today}
                        onChange={e => setFromDate(e.target.value)} />
                    </div>
                    <div className="bp-date-row">
                      <div className="bp-field">
                        <label className="bp-label">Giờ nhận phòng</label>
                        <input type="time" className="bp-input" value={fromHour}
                          onChange={e => setFromHour(e.target.value)} />
                      </div>
                      <div className="bp-field">
                        <label className="bp-label">Giờ trả phòng</label>
                        <input type="time" className="bp-input" value={toHour}
                          onChange={e => setToHour(e.target.value)} />
                      </div>
                    </div>
                  </>
                )}

                {}
                <div className="bp-field">
                  <label className="bp-label"><UserOutlined /> Số khách</label>
                  <select className="bp-input" value={guests} onChange={e => setGuests(Number(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} khách</option>)}
                  </select>
                </div>

                {error && <div className="bp-error">{error}</div>}

                <button
                  className="bp-primary-btn"
                  disabled={estimate <= 0}
                  onClick={handleProceedToPayment}
                >
                  Tiếp tục thanh toán cọc →
                </button>
                <p className="bp-note">Bạn chỉ cần đặt cọc 20% để xác nhận booking</p>
              </div>
            )}

            {}
            {step === "payment" && (
              <div className="bp-card">
                <h2 className="bp-card-title"><CreditCardOutlined /> Thanh toán cọc đặt phòng</h2>

                {}
                <div className="bp-summary-box">
                  <div className="bp-summary-row">
                    <span>Loại thuê:</span>
                    <span>{RENT_LABEL[rentType] ?? rentType}</span>
                  </div>
                  <div className="bp-summary-row">
                    <span>Thời gian:</span>
                    <span>
                      {rentType === "Hour"
                        ? `${fromHour} – ${toHour} ngày ${fmtDate(fromDate)}`
                        : `${fmtDate(fromDate)} → ${fmtDate(toDate)}`}
                    </span>
                  </div>
                  <div className="bp-summary-row">
                    <span>Số {rentType === "Hour" ? "giờ" : "đêm/ngày"}:</span>
                    <span>{units}</span>
                  </div>
                  <div className="bp-summary-row">
                    <span>Đơn giá:</span>
                    <span>{fmt(selectedRate?.price)}{RENT_UNIT[rentType] ?? ""}</span>
                  </div>
                  <div className="bp-summary-row">
                    <span>Tổng dự tính:</span>
                    <span style={{ fontWeight: 700 }}>{fmt(estimate)}</span>
                  </div>
                  <div className="bp-summary-divider" />
                  <div className="bp-summary-row bp-deposit-row">
                    <span>Tiền cọc cần trả (20%):</span>
                    <span className="bp-deposit-amount">{fmt(deposit)}</span>
                  </div>
                </div>

                {}
                <label className="bp-label" style={{ marginTop: 20 }}>Phương thức thanh toán</label>
                <div className="bp-pay-methods">
                  {[
                    { key: "bank", label: "Chuyển khoản ngân hàng", icon: <BankOutlined /> },
                    { key: "card", label: "Thẻ tín dụng / Ghi nợ", icon: <CreditCardOutlined /> },
                  ].map(m => (
                    <div
                      key={m.key}
                      className={`bp-pay-method ${payMethod === m.key ? "active" : ""}`}
                      onClick={() => setPayMethod(m.key as "bank" | "card")}
                    >
                      <span style={{ fontSize: 22 }}>{m.icon}</span>
                      <span>{m.label}</span>
                      {payMethod === m.key && <CheckCircleOutlined style={{ marginLeft: "auto", color: "#22c55e" }} />}
                    </div>
                  ))}
                </div>

                {payMethod === "bank" && (
                  <div className="bp-bank-info">
                    <div className="bp-bank-row"><span>Ngân hàng:</span><strong>Vietcombank</strong></div>
                    <div className="bp-bank-row"><span>Số tài khoản:</span><strong>1234 5678 9012 3456</strong></div>
                    <div className="bp-bank-row"><span>Chủ tài khoản:</span><strong>KHACH SAN ABC</strong></div>
                    <div className="bp-bank-row"><span>Số tiền:</span><strong style={{ color: "#f59e0b" }}>{fmt(deposit)}</strong></div>
                    <div className="bp-bank-row"><span>Nội dung CK:</span><strong>DATPHONG {roomType?.name?.toUpperCase()}</strong></div>
                  </div>
                )}

                {payMethod === "card" && (
                  <div className="bp-card-form">
                    <div className="bp-field">
                      <label className="bp-label">Số thẻ</label>
                      <input className="bp-input" placeholder="1234 5678 9012 3456" maxLength={19} />
                    </div>
                    <div className="bp-date-row">
                      <div className="bp-field">
                        <label className="bp-label">Ngày hết hạn</label>
                        <input className="bp-input" placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div className="bp-field">
                        <label className="bp-label">CVV</label>
                        <input className="bp-input" placeholder="123" maxLength={3} type="password" />
                      </div>
                    </div>
                  </div>
                )}

                {error && <div className="bp-error">{error}</div>}

                <div className="bp-pay-actions">
                  <button className="bp-back-step-btn" onClick={() => setStep("select")} disabled={paying || booking}>
                    ← Quay lại
                  </button>
                  <button className="bp-primary-btn" onClick={handlePay} disabled={paying || booking}>
                    {paying
                      ? <><LoadingOutlined style={{ marginRight: 8 }} />Đang xử lý thanh toán...</>
                      : booking
                      ? <><LoadingOutlined style={{ marginRight: 8 }} />Đang tạo đặt phòng...</>
                      : <><SafetyOutlined style={{ marginRight: 8 }} />Xác nhận thanh toán {fmt(deposit)}</>
                    }
                  </button>
                </div>
                <p className="bp-note"><SafetyOutlined /> Thanh toán được bảo mật. Số dư còn lại thanh toán khi trả phòng.</p>
              </div>
            )}

            {}
            {step === "done" && (
              <div className="bp-card" style={{ textAlign: "center", padding: "48px 32px" }}>
                <CheckCircleOutlined style={{ fontSize: 64, color: "#22c55e", marginBottom: 20 }} />
                <h2 style={{ color: "#166534", margin: "0 0 12px" }}>Đặt phòng thành công!</h2>
                <p style={{ color: "#475569", maxWidth: 400, margin: "0 auto 8px" }}>
                  Bạn đã đặt cọc <strong>{fmt(deposit)}</strong> thành công.
                  Admin sẽ xác nhận và làm thủ tục check-in cho bạn.
                </p>
                {createdBookingId && (
                  <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 28 }}>
                    Mã đặt phòng: <strong>#{createdBookingId}</strong>
                  </p>
                )}
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="bp-outline-btn" onClick={() => navigate("/rooms")}>
                    Tiếp tục xem phòng
                  </button>
                  <button className="bp-primary-btn" style={{ maxWidth: 240 }} onClick={() => navigate("/current-bookings")}>
                    Xem phòng đang đặt
                  </button>
                </div>
              </div>
            )}
          </div>

          {}
          {step !== "done" && (
            <aside className="bp-sidebar">
              <div className="bp-sidebar-card">
                <div className="bp-sidebar-title">Tóm tắt đặt phòng</div>
                <div className="bp-sidebar-room">{roomType.name}</div>

                <div className="bp-sidebar-row">
                  <span>Loại thuê</span>
                  <span>{selectedRate ? (RENT_LABEL[selectedRate.rentType] ?? selectedRate.rentType) : "—"}</span>
                </div>
                <div className="bp-sidebar-row">
                  <span>Nhận phòng</span>
                  <span>
                    {rentType === "Hour" && fromHour ? `${fromHour} – ${fmtDate(fromDate)}`
                      : fromDate ? fmtDate(fromDate) : "—"}
                  </span>
                </div>
                <div className="bp-sidebar-row">
                  <span>Trả phòng</span>
                  <span>
                    {rentType === "Hour" && toHour ? `${toHour} – ${fmtDate(fromDate)}`
                      : toDate ? fmtDate(toDate) : "—"}
                  </span>
                </div>
                <div className="bp-sidebar-row">
                  <span>Số khách</span>
                  <span>{guests} khách</span>
                </div>

                {estimate > 0 && (<>
                  <div className="bp-sidebar-divider" />
                  <div className="bp-sidebar-row">
                    <span>Dự tính tổng</span>
                    <span>{fmt(estimate)}</span>
                  </div>
                  <div className="bp-sidebar-row bp-sidebar-deposit">
                    <span><DollarOutlined /> Tiền cọc (20%)</span>
                    <strong style={{ color: "#f59e0b" }}>{fmt(deposit)}</strong>
                  </div>
                  <div className="bp-sidebar-row" style={{ fontSize: 12, color: "#94a3b8" }}>
                    <span>Thanh toán sau</span>
                    <span>{fmt(Math.max(0, estimate - deposit))}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 8, lineHeight: 1.5 }}>
                    * Giá thực tế xác nhận khi check-in. Tiền cọc sẽ trừ vào hóa đơn cuối.
                  </p>
                </>)}
              </div>
            </aside>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
