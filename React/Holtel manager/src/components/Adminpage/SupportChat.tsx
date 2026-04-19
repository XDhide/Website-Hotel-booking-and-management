import { useState, useEffect, useRef, useCallback } from 'react'
import { UserOutlined, SendOutlined, MessageOutlined, ReloadOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { apiClient } from '../../constant/api'
import { API } from '../../constant/config'
import '../../assets/css/Adminpage/SupportChat.css'

interface Chat {
  id: number
  userId: string
  status: string
  createdAt?: string
  closedAt?: string
}

interface Message {
  id: number
  supportChatId: number
  senderId: string
  message: string
  sentAt: string
  isRead?: boolean
}

const STATUS_COLOR: Record<string, string> = {
  Open: '#22c55e', InProgress: '#3b82f6', Closed: '#6b7280',
}
const STATUS_LABEL: Record<string, string> = {
  Open: 'Mở', InProgress: 'Đang xử lý', Closed: 'Đã đóng',
}

export default function SupportChat() {
  const [chats, setChats]               = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages]         = useState<Message[]>([])
  const [inputText, setInputText]       = useState('')
  const [loadingChats, setLoadingChats] = useState(true)
  const [loadingMsgs, setLoadingMsgs]   = useState(false)
  const [sending, setSending]           = useState(false)
  const [error, setError]               = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Lấy ID admin từ token (dùng để phân biệt bubble trái/phải)
  const getAdminId = () => {
    try {
      const token = localStorage.getItem('hotel_token') ?? ''
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload?.sub ?? payload?.nameid ?? payload?.userId ?? 'admin'
    } catch { return 'admin' }
  }
  const adminId = getAdminId()

  const loadChats = useCallback(async () => {
    setLoadingChats(true); setError('')
    try {
      // Admin dùng endpoint lấy tất cả chat
      const res = await apiClient.get(`${API}/SupportChat/my-chats`)
      const raw = res.data
      const list = Array.isArray(raw) ? raw : raw?.data ?? []
      setChats(list)
    } catch (e: any) {
      setError('Không thể tải danh sách chat')
      // fallback mock
      setChats([
        { id: 1, userId: 'user1', status: 'InProgress' },
        { id: 2, userId: 'user2', status: 'Open' },
        { id: 3, userId: 'user3', status: 'Closed' },
      ])
    } finally { setLoadingChats(false) }
  }, [])

  const loadMessages = useCallback(async (chatId: number) => {
    setLoadingMsgs(true)
    try {
      const res = await apiClient.get(`${API}/SupportChat/${chatId}/messages`)
      const raw = res.data
      const list = Array.isArray(raw) ? raw : raw?.data ?? []
      setMessages(list)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
    } catch {
      setMessages([])
    } finally { setLoadingMsgs(false) }
  }, [])

  useEffect(() => { loadChats() }, [loadChats])

  useEffect(() => {
    if (!selectedChat || selectedChat.status === 'Closed') return
    const timer = setInterval(() => loadMessages(selectedChat.id), 8000)
    return () => clearInterval(timer)
  }, [selectedChat, loadMessages])

  const selectChat = (chat: Chat) => {
    setSelectedChat(chat)
    setMessages([])
    loadMessages(chat.id)
  }

  const handleSend = async () => {
    if (!inputText.trim() || !selectedChat) return
    setSending(true)
    const text = inputText.trim()
    setInputText('')
    try {
      await apiClient.post(`${API}/SupportChat/send-message`, {
        supportChatId: selectedChat.id,
        message: text,
      })
      await loadMessages(selectedChat.id)
    } catch {
      // Optimistic
      setMessages(prev => [...prev, {
        id: Date.now(), supportChatId: selectedChat.id,
        senderId: adminId, message: text,
        sentAt: new Date().toISOString(),
      }])
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
    } finally { setSending(false) }
  }

  const handleClose = async () => {
    if (!selectedChat || !window.confirm('Đóng cuộc trò chuyện này?')) return
    try {
      await apiClient.post(`${API}/SupportChat/${selectedChat.id}/close`)
      const updated = { ...selectedChat, status: 'Closed' }
      setChats(prev => prev.map(c => c.id === selectedChat.id ? updated : c))
      setSelectedChat(updated)
    } catch (e: any) { alert(e?.response?.data || 'Không thể đóng chat') }
  }

  const fmtTime = (s: string) => {
    try { return new Date(s).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }
    catch { return '' }
  }

  return (
    <div className="support-wapper">
      {/* ── Danh sách chat ── */}
      <div className="support-user-box">
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.82rem' }}>
            CHAT ({chats.length})
          </span>
          <button onClick={loadChats} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            <ReloadOutlined />
          </button>
        </div>

        {loadingChats ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.3)' }}>Đang tải...</div>
        ) : chats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
            Chưa có cuộc trò chuyện nào
          </div>
        ) : chats.map(chat => (
          <div
            key={chat.id}
            className={`support-user-person ${selectedChat?.id === chat.id ? 'active' : ''}`}
            onClick={() => selectChat(chat)}
          >
            <div className="support-user-icon">
              <UserOutlined className="support-user-avatar-icon" />
            </div>
            <div className="support-user-info">
              <div className="support-user-name">Chat #{chat.id}</div>
              <div style={{ fontSize: '0.75rem', color: STATUS_COLOR[chat.status] ?? '#94a3b8', marginTop: 2 }}>
                ● {STATUS_LABEL[chat.status] ?? chat.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Khung chat ── */}
      <div className="support-chat-box">
        {!selectedChat ? (
          <div className="support-chat-placeholder">
            <MessageOutlined className="support-chat-placeholder-icon" />
            <p>Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="support-chat-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="support-user-icon small">
                  <UserOutlined className="support-user-avatar-icon" />
                </div>
                <div>
                  <div className="support-chat-header-name">Chat #{selectedChat.id}</div>
                  <div style={{ fontSize: '0.72rem', color: STATUS_COLOR[selectedChat.status] }}>
                    ● {STATUS_LABEL[selectedChat.status]}
                  </div>
                </div>
              </div>
              {selectedChat.status !== 'Closed' && (
                <button onClick={handleClose} style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171', borderRadius: 6, padding: '5px 12px',
                  cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <CloseCircleOutlined /> Đóng chat
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="support-chat-box-output">
              {loadingMsgs ? (
                <div style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.3)' }}>Đang tải tin nhắn...</div>
              ) : messages.length === 0 ? (
                <div className="support-chat-empty">Chưa có tin nhắn. Hãy bắt đầu trò chuyện!</div>
              ) : messages.map(msg => {
                const isMe = msg.senderId === adminId
                return (
                  <div key={msg.id} className={`support-message-row ${isMe ? 'admin' : 'user'}`}>
                    <div className="support-message-bubble">
                      <span>{msg.message}</span>
                      <span className="support-message-time">{fmtTime(msg.sentAt)}</span>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="support-chat-box-input">
              {selectedChat.status === 'Closed' ? (
                <div style={{ flex: 1, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', padding: '10px 0' }}>
                  Cuộc trò chuyện đã đóng
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn... (Enter để gửi)"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    disabled={sending}
                  />
                  <button onClick={handleSend} disabled={sending || !inputText.trim()}>
                    <SendOutlined /> {sending ? '...' : 'Gửi'}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}