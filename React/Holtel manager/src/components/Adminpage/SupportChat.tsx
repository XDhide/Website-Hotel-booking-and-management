import {
  apiGetMyChats,
  apiGetMessages,
  apiSendMessage,
  apiCloseChat,
} from "../../services/SupportChatService";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  UserOutlined,
  SendOutlined,
  MessageOutlined,
  ReloadOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import "../../assets/css/Adminpage/SupportChat.css";

interface Chat {
  id: number;
  userId: string;
  status: string;
  createdAt?: string;
  closedAt?: string;
}

interface Message {
  id: number;
  supportChatId: number;
  senderId: string;
  message: string;
  sentAt: string;
  isStaff?: boolean;
}

const STATUS_COLOR: Record<string, string> = {
  Open: "#22c55e",
  InProgress: "#3b82f6",
  Closed: "#6b7280",
};
const STATUS_LABEL: Record<string, string> = {
  Open: "Mở",
  InProgress: "Đang xử lý",
  Closed: "Đã đóng",
};

export default function SupportChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getAdminId = () => {
    try {
      const token = localStorage.getItem("hotel_token") ?? "";
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.sub ?? payload?.nameid ?? payload?.userId ?? "admin";
    } catch {
      return "admin";
    }
  };
  const adminId = getAdminId();

  const loadChats = useCallback(async () => {
    setLoadingChats(true);
    setError("");
    try {
      const res = await apiGetMyChats();
      const raw = res;
      const list = Array.isArray(raw) ? raw : (raw?.data ?? []);

      setChats(list.filter((c: Chat) => c.status !== "Closed"));
    } catch {
      setError("Không thể tải danh sách chat. Vui lòng kiểm tra kết nối.");
      setChats([]);
    } finally {
      setLoadingChats(false);
    }
  }, []);

  const loadMessages = useCallback(async (chatId: number) => {
    setLoadingMsgs(true);
    try {
      const res = await apiGetMessages(chatId);
      const raw = res;
      const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
      setMessages(list);
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        80,
      );
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (!selectedChat) return;
    const timer = setInterval(() => loadMessages(selectedChat.id), 8000);
    return () => clearInterval(timer);
  }, [selectedChat, loadMessages]);

  const selectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setMessages([]);
    loadMessages(chat.id);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !selectedChat) return;
    setSending(true);
    const text = inputText.trim();
    setInputText("");
    try {
      await apiSendMessage({
        supportChatId: selectedChat.id,
        message: text,
      });
      await loadMessages(selectedChat.id);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          supportChatId: selectedChat.id,
          senderId: adminId,
          message: text,
          sentAt: new Date().toISOString(),
        },
      ]);
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        80,
      );
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (
      !selectedChat ||
      !window.confirm("Kết thúc và xóa cuộc trò chuyện này?")
    )
      return;
    try {
      await apiCloseChat(selectedChat.id);

      setChats((prev) => prev.filter((c) => c.id !== selectedChat.id));
      setSelectedChat(null);
      setMessages([]);
    } catch (e: any) {
      alert(e?.response?.data || "Không thể kết thúc chat");
    }
  };

  const fmtTime = (s: string) => {
    try {
      return new Date(s).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="support-wapper">
      {}
      <div className="support-user-box">
        <div className="support-user-header">
          <span className="support-user-title">HỖ TRỢ ({chats.length})</span>
          <button onClick={loadChats} className="support-reload-btn">
            <ReloadOutlined />
          </button>
        </div>

        {error && <div className="support-error-msg">{error}</div>}

        {loadingChats ? (
          <div className="support-loading">Đang tải...</div>
        ) : chats.length === 0 ? (
          <div className="support-empty-state">Chưa có yêu cầu hỗ trợ nào</div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`support-user-person ${selectedChat?.id === chat.id ? "active" : ""}`}
              onClick={() => selectChat(chat)}
            >
              <div className="support-user-icon">
                <UserOutlined className="support-user-avatar-icon" />
              </div>
              <div className="support-user-info">
                <div className="support-user-name">Khách #{chat.id}</div>
                <div
                  className="support-status-text"
                  style={{ color: STATUS_COLOR[chat.status] ?? "#94a3b8" }}
                >
                  <span
                    className="support-status-dot"
                    style={{
                      background: STATUS_COLOR[chat.status] ?? "#94a3b8",
                    }}
                  />
                  {STATUS_LABEL[chat.status] ?? chat.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {}
      <div className="support-chat-box">
        {!selectedChat ? (
          <div className="support-chat-placeholder">
            <MessageOutlined className="support-chat-placeholder-icon" />
            <p>Chọn một yêu cầu hỗ trợ để bắt đầu</p>
          </div>
        ) : (
          <>
            {}
            <div className="support-chat-header">
              <div className="support-header-left">
                <div className="support-user-icon small">
                  <UserOutlined className="support-user-avatar-icon" />
                </div>
                <div>
                  <div className="support-chat-header-name">
                    Khách #{selectedChat.id}
                  </div>
                  <div
                    className="support-header-status"
                    style={{ color: STATUS_COLOR[selectedChat.status] }}
                  >
                    <span
                      className="support-status-dot"
                      style={{ background: STATUS_COLOR[selectedChat.status] }}
                    />
                    {STATUS_LABEL[selectedChat.status]}
                  </div>
                </div>
              </div>
              <button onClick={handleClose} className="support-close-btn">
                <CloseCircleOutlined /> Kết thúc hội thoại
              </button>
            </div>

            {}
            <div className="support-chat-box-output">
              {loadingMsgs ? (
                <div className="support-loading">Đang tải tin nhắn...</div>
              ) : messages.length === 0 ? (
                <div className="support-chat-empty">
                  Chưa có tin nhắn. Hãy bắt đầu trò chuyện!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === adminId || msg.isStaff === true;
                  return (
                    <div
                      key={msg.id}
                      className={`support-message-row ${isMe ? "admin" : "user"}`}
                    >
                      <div className="support-message-bubble">
                        <span>{msg.message}</span>
                        <span className="support-message-time">
                          {fmtTime(msg.sentAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {}
            <div className="support-chat-box-input">
              <input
                type="text"
                placeholder="Nhập tin nhắn... (Enter để gửi)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={sending || !inputText.trim()}
              >
                <SendOutlined /> {sending ? "..." : "Gửi"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
