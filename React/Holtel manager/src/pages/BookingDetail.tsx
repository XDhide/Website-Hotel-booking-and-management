// src/components/CurrentBookings/BookingDetail.tsx
import { useState, useRef, useEffect } from "react";
import type { BookingRoom } from "./CurrentBookings";
import {
  ArrowLeftOutlined,
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  TagOutlined,
  BarcodeOutlined,
  MoonOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
  SwapOutlined,
  MessageOutlined,
  RobotOutlined,
  UserOutlined,
  SendOutlined,
  SmileOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  ClearOutlined,
  CarOutlined,
  GiftOutlined,
  ExperimentOutlined,
  ToolOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import "../../assets/css/Profile/BookingDetail.css";

interface Props {
  booking: BookingRoom;
  onBack: () => void;
}

interface ChatMessage {
  from: "bot" | "user";
  text: string;
  time: string;
}

const SERVICES = [
  { key: "clean",   icon: <ClearOutlined />,      label: "Dọn phòng" },
  { key: "food",    icon: <ExperimentOutlined />,  label: "Đồ ăn & uống" },
  { key: "towel",   icon: <HomeOutlined />,        label: "Thay khăn" },
  { key: "taxi",    icon: <CarOutlined />,         label: "Đặt taxi" },
  { key: "gift",    icon: <GiftOutlined />,        label: "Quà & bánh" },
  { key: "laundry", icon: <ExperimentOutlined />,  label: "Giặt ủi" },
];

const SUPPORT_TYPES = [
  "Máy lạnh hỏng",
  "TV không hoạt động",
  "Vòi nước bị rò rỉ",
  "Mất điện trong phòng",
  "Yêu cầu thêm gối/chăn",
  "Khác",
];

const ROOM_CHANGE_OPTIONS = [
  "Standard - Phòng tiêu chuẩn",
  "Deluxe - Phòng cao cấp",
  "Suite - Phòng hạng sang",
  "Family - Phòng gia đình",
  "Executive - Phòng điều hành",
];

const BOT_REPLIES = [
  "Cảm ơn bạn! Nhân viên sẽ phản hồi trong vài phút.",
  "Tôi đã ghi nhận yêu cầu của bạn. Chúng tôi sẽ liên hệ sớm!",
  "Rất vui được hỗ trợ bạn. Bạn có câu hỏi nào khác không?",
  "Thông tin đã được gửi đến bộ phận hỗ trợ. Cảm ơn bạn!",
];

function getTime() {
  return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export default function BookingDetail({ booking, onBack }: Props) {
  const total = booking.services.reduce((s, r) => s + r.amount, 0);

  const [svcSuccess, setSvcSuccess]         = useState("");
  const [reqType, setReqType]               = useState("");
  const [reqNote, setReqNote]               = useState("");
  const [reqSuccess, setReqSuccess]         = useState(false);
  const [changeType, setChangeType]         = useState("");
  const [changeNote, setChangeNote]         = useState("");
  const [changeSuccess, setChangeSuccess]   = useState(false);

  const [chatMsg, setChatMsg]               = useState("");
  const [chatTyping, setChatTyping]         = useState(false);
  const [botIdx, setBotIdx]                 = useState(0);
  const [messages, setMessages]             = useState<ChatMessage[]>([
    { from: "bot", text: `Xin chào! Tôi có thể giúp gì về Phòng ${booking.roomNumber}?`, time: getTime() },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatTyping]);

  const handleService = (label: string) => {
    setSvcSuccess(`Đã gửi yêu cầu "${label}"! Nhân viên sẽ phục vụ sớm.`);
    setTimeout(() => setSvcSuccess(""), 3500);
  };

  const handleRequest = () => {
    if (!reqType || reqType === "") return;
    setReqSuccess(true);
    setReqNote("");
    setReqType("");
    setTimeout(() => setReqSuccess(false), 4000);
  };

  const handleChangeRoom = () => {
    if (!changeType || changeType === "") return;
    setChangeSuccess(true);
    setChangeNote("");
    setChangeType("");
    setTimeout(() => setChangeSuccess(false), 4000);
  };

  const handleCancelRoom = () => {
    if (window.confirm("Bạn có chắc muốn hủy đặt phòng này không?")) {
      alert("Đã gửi yêu cầu hủy. Lễ tân sẽ xử lý trong 30 phút.");
    }
  };

  const sendChat = () => {
    const text = chatMsg.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { from: "user", text, time: getTime() }]);
    setChatMsg("");
    setChatTyping(true);
    setTimeout(() => {
      setChatTyping(false);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: BOT_REPLIES[botIdx % BOT_REPLIES.length], time: getTime() },
      ]);
      setBotIdx((i) => i + 1);
    }, 1200);
  };

  const handleChatKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) sendChat();
  };

  return (
    <div className="bd-page">
      <div className="bd-back-bar">
        <div className="container">
          <button className="bd-back-btn" onClick={onBack}>
            <ArrowLeftOutlined /> Quay lại danh sách
          </button>
        </div>
      </div>

      <div className="container bd-body">
        <div className="bd-left">

          {/* Thông tin cơ bản */}
          <div className="bd-card">
            <div className="bd-room-number-big">
              <HomeOutlined /> Phòng {booking.roomNumber}
            </div>
            <div className="bd-info-grid">
              <div className="bd-info-item">
                <label><TagOutlined /> Loại phòng</label>
                <span>{booking.type}</span>
              </div>
              <div className="bd-info-item">
                <label><TeamOutlined /> Số khách</label>
                <span>{booking.guests} khách</span>
              </div>
              <div className="bd-info-item">
                <label><CalendarOutlined /> Nhận phòng</label>
                <span>{booking.checkIn}</span>
              </div>
              <div className="bd-info-item">
                <label><CalendarOutlined /> Trả phòng</label>
                <span>{booking.checkOut}</span>
              </div>
              <div className="bd-info-item">
                <label><MoonOutlined /> Số đêm</label>
                <span>{booking.nights} đêm</span>
              </div>
              <div className="bd-info-item">
                <label><BarcodeOutlined /> Mã đặt phòng</label>
                <span className="bd-code">{booking.code}</span>
              </div>
            </div>
          </div>

          {/* Gọi dịch vụ */}
          <div className="bd-card">
            <h2 className="bd-card-title">
              <CustomerServiceOutlined /> Gọi dịch vụ
            </h2>
            <div className="bd-service-grid">
              {SERVICES.map((s) => (
                <button
                  key={s.key}
                  className="bd-service-btn"
                  onClick={() => handleService(s.label)}
                >
                  <span className="bd-svc-icon">{s.icon}</span>
                  <span className="bd-svc-label">{s.label}</span>
                </button>
              ))}
            </div>
            {svcSuccess && (
              <div className="bd-success-msg">
                <CheckCircleOutlined /> {svcSuccess}
              </div>
            )}
          </div>

          {/* Yêu cầu hỗ trợ */}
          <div className="bd-card">
            <h2 className="bd-card-title">
              <WarningOutlined /> Yêu cầu hỗ trợ
            </h2>
            <div className="bd-request-form">
              <select
                className="bd-select"
                value={reqType}
                onChange={(e) => setReqType(e.target.value)}
              >
                <option value="">Chọn loại yêu cầu...</option>
                {SUPPORT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <textarea
                className="bd-textarea"
                placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                value={reqNote}
                onChange={(e) => setReqNote(e.target.value)}
              />
              <button className="bd-btn-primary" onClick={handleRequest}>
                <ToolOutlined /> Gửi yêu cầu
              </button>
            </div>
            {reqSuccess && (
              <div className="bd-success-msg" style={{ marginTop: 10 }}>
                <CheckCircleOutlined /> Yêu cầu đã được gửi! Nhân viên sẽ hỗ trợ trong 15 phút.
              </div>
            )}
          </div>

          {/* Đổi phòng */}
          <div className="bd-card">
            <h2 className="bd-card-title">
              <SwapOutlined /> Yêu cầu đổi phòng
            </h2>
            <div className="bd-request-form">
              <select
                className="bd-select"
                value={changeType}
                onChange={(e) => setChangeType(e.target.value)}
              >
                <option value="">Chọn loại phòng muốn đổi...</option>
                {ROOM_CHANGE_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <textarea
                className="bd-textarea"
                placeholder="Lý do đổi phòng (không bắt buộc)..."
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
              />
              <div className="bd-action-row">
                <button className="bd-btn-primary" onClick={handleChangeRoom}>
                  <SwapOutlined /> Gửi yêu cầu đổi phòng
                </button>
                <button className="bd-btn-danger" onClick={handleCancelRoom}>
                  <CloseCircleOutlined /> Hủy đặt phòng
                </button>
              </div>
            </div>
            {changeSuccess && (
              <div className="bd-success-msg" style={{ marginTop: 10 }}>
                <CheckCircleOutlined /> Yêu cầu đổi phòng đã gửi! Lễ tân sẽ xác nhận trong 30 phút.
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="bd-card bd-chat-card">
            <h2 className="bd-card-title">
              <MessageOutlined /> Nhắn tin hỗ trợ
            </h2>
            <div className="bd-chat-window">
              <div className="bd-chat-header">
                <div className="bd-chat-avatar">
                  <RobotOutlined />
                  <span className="bd-chat-online-dot" />
                </div>
                <div>
                  <div className="bd-chat-title">Hỗ trợ trực tuyến</div>
                  <div className="bd-chat-sub">Đang hoạt động</div>
                </div>
              </div>

              <div className="bd-chat-msgs">
                {messages.map((m, i) => (
                  <div key={i} className={`bd-msg-row ${m.from}`}>
                    {m.from === "bot" && (
                      <div className="bd-msg-av">
                        <RobotOutlined />
                      </div>
                    )}
                    <div className="bd-msg-bubble-wrap">
                      <div className={`bd-bubble ${m.from}`}>{m.text}</div>
                      <div className="bd-msg-time">{m.time}</div>
                    </div>
                    {m.from === "user" && (
                      <div className="bd-msg-av user">
                        <UserOutlined />
                      </div>
                    )}
                  </div>
                ))}
                {chatTyping && (
                  <div className="bd-msg-row bot">
                    <div className="bd-msg-av">
                      <RobotOutlined />
                    </div>
                    <div className="bd-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="bd-chat-input-row">
                <button className="bd-emoji-btn" title="Emoji">
                  <SmileOutlined />
                </button>
                <input
                  className="bd-chat-input"
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  onKeyDown={handleChatKey}
                  placeholder="Nhập tin nhắn..."
                  maxLength={300}
                />
                <button
                  className={`bd-send-btn${chatMsg.trim() ? " active" : ""}`}
                  onClick={sendChat}
                  disabled={!chatMsg.trim()}
                >
                  <SendOutlined />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Hóa đơn */}
        <div className="bd-right">
          <div className="bd-invoice-card">
            <h2 className="bd-card-title">
              <FileTextOutlined /> Hóa đơn hiện tại
            </h2>
            <div className="bd-invoice-rows">
              {booking.services.map((s, i) => (
                <div key={i} className="bd-invoice-row">
                  <span>{s.label}</span>
                  <span>{s.amount.toLocaleString("vi-VN")}₫</span>
                </div>
              ))}
            </div>
            <div className="bd-invoice-row total">
              <span>Tổng cộng</span>
              <span className="bd-total-amount">{total.toLocaleString("vi-VN")}₫</span>
            </div>
            <div className="bd-invoice-note">
              <WarningOutlined style={{ marginRight: 6 }} />
              Hóa đơn tạm tính. Các dịch vụ phát sinh sẽ được cộng thêm khi trả phòng.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
