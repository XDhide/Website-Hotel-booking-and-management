import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
  LockOutlined,
  UserOutlined,
  RobotOutlined,
  LoginOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import "../../assets/css/Homepage/ChatBubble.css";
import { apiClient } from "../../constant/api";
import { API } from "../../constant/config";
import {
  apiOpenChat,
  apiSendMessage,
  apiGetMessages,
} from "../../services/IncidencePaymentSupportChatServices";

interface Message {
  id: number;
  supportChatId: number;
  senderId: string;
  message: string;
  isStaff: boolean;
  sentAt: string;
}

interface ChatBubbleProps {
  isLoggedIn: boolean;
}

function getTime(isoStr?: string) {
  const d = isoStr ? new Date(isoStr) : new Date();
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatBubble({ isLoggedIn }: ChatBubbleProps) {
  const [open, setOpen]         = useState(false);
  const [msg, setMsg]           = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId]     = useState<number | null>(null);
  const [loading, setLoading]   = useState(false);
  const [sending, setSending]   = useState(false);
  const [closed, setClosed]     = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollBottom = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);

  const loadMessages = useCallback(async (id: number) => {
    try {
      const raw = await apiGetMessages(id);
      const list: Message[] = Array.isArray(raw) ? raw : raw?.data ?? [];
      setMessages(list);
      scrollBottom();
    } catch {  }
  }, []);

  const initChat = useCallback(async () => {
    if (chatId) return;
    setLoading(true);
    try {
      const res = await apiOpenChat();
      const id  = res?.id ?? res?.data?.id;
      if (id) {
        setChatId(id);
        setClosed(res?.status === "Closed");
        await loadMessages(id);
      }
    } catch {  }
    finally { setLoading(false); }
  }, [chatId, loadMessages]);

  useEffect(() => {
    if (!open || !chatId || closed) return;
    pollingRef.current = setInterval(async () => {
      try {
        
        const statusRes = await apiClient.get(`${API}/SupportChat/${chatId}/status`);
        const st = statusRes?.data?.status;
        if (st === "Deleted" || st === "Closed") {
          setClosed(true);
          setMessages(prev => [...prev]); 
          return;
        }
        
        const raw = await apiGetMessages(chatId);
        const list: Message[] = Array.isArray(raw) ? raw : raw?.data ?? [];
        setMessages(list);
      } catch {
        
        setClosed(true);
      }
    }, 6000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [open, chatId, closed]);

  useEffect(() => {
    if (open && isLoggedIn) initChat();
  }, [open, isLoggedIn, initChat]);

  const send = async () => {
    const text = msg.trim();
    if (!text || !chatId || sending) return;
    setSending(true);
    setMsg("");
    try {
      await apiSendMessage({ supportChatId: chatId, message: text });
      await loadMessages(chatId);
    } catch (e: any) {
      
      if (e?.message?.includes("đóng") || e?.message?.includes("Closed")) {
        setClosed(true);
      }
    }
    finally { setSending(false); }
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
                  {isLoggedIn ? (closed ? "Đã kết thúc" : "Đang hoạt động") : "Vui lòng đăng nhập"}
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
          ) : loading ? (
            <div className="cb-messages" style={{ justifyContent: "center", alignItems: "center" }}>
              <LoadingOutlined style={{ fontSize: 28, color: "#3b82f6" }} />
            </div>
          ) : (
            <>
              <div className="cb-messages">
                {messages.length === 0 && (
                  <div className="cb-msg-row bot">
                    <div className="cb-msg-avatar"><RobotOutlined /></div>
                    <div className="cb-msg-bubble-wrap">
                      <div className="cb-bubble bot">Xin chào! 👋 Tôi có thể giúp gì cho bạn?</div>
                      <div className="cb-msg-time">{getTime()}</div>
                    </div>
                  </div>
                )}

                {messages.map((m) => {
                  const isUser = !m.isStaff;
                  return (
                    <div key={m.id} className={`cb-msg-row ${isUser ? "user" : "bot"}`}>
                      {!isUser && (
                        <div className="cb-msg-avatar"><RobotOutlined /></div>
                      )}
                      <div className="cb-msg-bubble-wrap">
                        <div className={`cb-bubble ${isUser ? "user" : "bot"}`}>{m.message}</div>
                        <div className="cb-msg-time">{getTime(m.sentAt)}</div>
                      </div>
                      {isUser && (
                        <div className="cb-msg-avatar user"><UserOutlined /></div>
                      )}
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="cb-input-row">
                {closed ? (
                  <div style={{ flex: 1, textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "8px 0" }}>
                    Cuộc hội thoại đã kết thúc
                  </div>
                ) : (
                  <>
                    <input
                      className="cb-input"
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="Nhập tin nhắn..."
                      maxLength={300}
                      disabled={sending}
                    />
                    <button
                      className={`cb-send-btn${msg.trim() ? " active" : ""}`}
                      onClick={send}
                      disabled={!msg.trim() || sending}
                    >
                      {sending ? <LoadingOutlined /> : <SendOutlined />}
                    </button>
                  </>
                )}
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
