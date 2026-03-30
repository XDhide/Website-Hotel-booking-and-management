import { useState, useRef, useEffect } from "react";
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
  LockOutlined,
  UserOutlined,
  RobotOutlined,
  LoginOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import "../../assets/css/Homepage/ChatBubble.css";

interface Message {
  from: "bot" | "user";
  text: string;
  time: string;
}

interface ChatBubbleProps {
  isLoggedIn: boolean;
}

const BOT_REPLIES = [
  "Cảm ơn bạn! Nhân viên sẽ phản hồi trong vài phút.",
  "Tôi đã ghi nhận yêu cầu của bạn. Chúng tôi sẽ liên hệ sớm!",
  "Rất vui được hỗ trợ bạn. Bạn có câu hỏi nào khác không?",
  "Thông tin đã được gửi đến bộ phận hỗ trợ. Cảm ơn bạn đã liên hệ!",
];

function getTime() {
  return new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatBubble({ isLoggedIn }: ChatBubbleProps) {
  const [open, setOpen]       = useState(false);
  const [msg, setMsg]         = useState("");
  const [typing, setTyping]   = useState(false);
  const [replyIdx, setReplyIdx] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Xin chào! 👋 Tôi có thể giúp gì cho bạn?", time: getTime() },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, typing]);

  const send = () => {
    const text = msg.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { from: "user", text, time: getTime() }]);
    setMsg("");
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: BOT_REPLIES[replyIdx % BOT_REPLIES.length],
          time: getTime(),
        },
      ]);
      setReplyIdx((i) => i + 1);
    }, 1200);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) send();
  };

  return (
    <div className="cb-wrap">
      {open && (
        <div className="cb-window">
          <div className="cb-header">
            <div className="cb-header-left">
              <div className="cb-avatar-dot">
                <RobotOutlined />
                <span className="cb-online-dot" />
              </div>
              <div>
                <div className="cb-header-title">Hỗ trợ trực tuyến</div>
                <div className="cb-header-sub">
                  {isLoggedIn ? "Đang hoạt động" : "Vui lòng đăng nhập"}
                </div>
              </div>
            </div>
            <button className="cb-close-btn" onClick={() => setOpen(false)}>
              <CloseOutlined />
            </button>
          </div>

          {!isLoggedIn ? (
            <div className="cb-login-notice">
              <LockOutlined className="cb-lock-icon" />
              <p className="cb-login-text">
                Vui lòng <strong>đăng nhập</strong> để nhắn tin với đội ngũ hỗ trợ
                của chúng tôi.
              </p>
              <button className="cb-login-btn">
                <LoginOutlined style={{ marginRight: 8 }} />
                Đăng nhập ngay
              </button>
            </div>
          ) : (
            <>
              <div className="cb-messages">
                {messages.map((m, i) => (
                  <div key={i} className={`cb-msg-row ${m.from}`}>
                    {m.from === "bot" && (
                      <div className="cb-msg-avatar">
                        <RobotOutlined />
                      </div>
                    )}
                    <div className="cb-msg-bubble-wrap">
                      <div className={`cb-bubble ${m.from}`}>{m.text}</div>
                      <div className="cb-msg-time">{m.time}</div>
                    </div>
                    {m.from === "user" && (
                      <div className="cb-msg-avatar user">
                        <UserOutlined />
                      </div>
                    )}
                  </div>
                ))}

                {typing && (
                  <div className="cb-msg-row bot">
                    <div className="cb-msg-avatar">
                      <RobotOutlined />
                    </div>
                    <div className="cb-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              <div className="cb-input-row">
                <button className="cb-emoji-btn" title="Emoji">
                  <SmileOutlined />
                </button>
                <input
                  className="cb-input"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Nhập tin nhắn..."
                  maxLength={300}
                />
                <button
                  className={`cb-send-btn${msg.trim() ? " active" : ""}`}
                  onClick={send}
                  disabled={!msg.trim()}
                >
                  <SendOutlined />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button
        className={`cb-bubble-btn${open ? " open" : ""}`}
        onClick={() => setOpen((p) => !p)}
      >
        {open ? <CloseOutlined /> : <MessageOutlined />}
      </button>
    </div>
  );
}
