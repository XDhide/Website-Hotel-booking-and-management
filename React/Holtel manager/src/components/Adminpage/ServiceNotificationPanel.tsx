import { useState, useEffect, useCallback } from 'react'
import { BellOutlined, CheckOutlined, ReloadOutlined, HomeOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { apiClient } from '../../constant/api'
import { API } from '../../constant/config'

interface Notif {
  id: number
  invoiceDetailId: number
  invoiceId: number
  roomUseId: number
  userId: string
  roomNumber: string
  roomTypeName: string
  serviceName: string
  quantity: number
  totalPrice: number
  isRead: boolean
  createdAt: string
}

const fmt = (v?: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v ?? 0)

const fmtTime = (s: string) => {
  try {
    return new Date(s).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return s }
}

export default function ServiceNotificationPanel() {
  const [notifs, setNotifs]     = useState<Notif[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<'all' | 'unread'>('all')
  const [marking, setMarking]   = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get(`${API}/invoicedetail/service-notifications`)
      const raw = res.data
      setNotifs(Array.isArray(raw) ? raw : raw?.data ?? [])
    } catch {
      setNotifs([])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-refresh mỗi 15s
  useEffect(() => {
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [load])

  const markRead = async (id: number) => {
    setMarking(id)
    try {
      await apiClient.post(`${API}/invoicedetail/service-notifications/${id}/read`)
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch { /* ignore */ }
    finally { setMarking(null) }
  }

  const markAllRead = async () => {
    try {
      await apiClient.post(`${API}/invoicedetail/service-notifications/read-all`)
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch { /* ignore */ }
  }

  const filtered = filter === 'unread' ? notifs.filter(n => !n.isRead) : notifs
  const unreadCount = notifs.filter(n => !n.isRead).length

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <BellOutlined /> Thông báo gọi dịch vụ
            {unreadCount > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700,
                borderRadius: 20, padding: '2px 10px', marginLeft: 4 }}>
                {unreadCount} mới
              </span>
            )}
          </h2>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            Yêu cầu dịch vụ từ khách đang lưu trú — tự động cập nhật mỗi 15 giây
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{
              background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
              color: '#22c55e', borderRadius: 8, padding: '8px 14px',
              cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <CheckOutlined /> Đánh dấu tất cả đã đọc
            </button>
          )}
          <button onClick={load} style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: '8px 12px',
            cursor: 'pointer', fontSize: 13,
          }}>
            <ReloadOutlined />
          </button>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'all',    label: `Tất cả (${notifs.length})` },
          { key: 'unread', label: `Chưa đọc (${unreadCount})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key as 'all' | 'unread')} style={{
            padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: 13,
            background: filter === f.key ? '#3b82f6' : 'rgba(255,255,255,0.07)',
            color: filter === f.key ? '#fff' : 'rgba(255,255,255,0.5)',
          }}>{f.label}</button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>
          <BellOutlined style={{ fontSize: 36, marginBottom: 12, display: 'block' }} />
          {filter === 'unread' ? 'Không có thông báo mới' : 'Chưa có yêu cầu dịch vụ nào'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(n => (
            <div key={n.id} style={{
              background: n.isRead ? 'rgba(255,255,255,0.04)' : 'rgba(59,130,246,0.1)',
              border: `1px solid ${n.isRead ? 'rgba(255,255,255,0.08)' : 'rgba(59,130,246,0.3)'}`,
              borderRadius: 14, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
              transition: 'all 0.2s',
            }}>
              {/* Icon */}
              <div style={{
                width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                background: n.isRead ? 'rgba(255,255,255,0.07)' : 'rgba(59,130,246,0.2)',
                color: n.isRead ? 'rgba(255,255,255,0.4)' : '#60a5fa',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>
                🛎️
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: n.isRead ? 'rgba(255,255,255,0.6)' : '#fff', marginBottom: 4 }}>
                  <HomeOutlined style={{ marginRight: 6, color: '#60a5fa' }} />
                  Phòng {n.roomNumber}
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginLeft: 6 }}>
                    · {n.roomTypeName}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: n.isRead ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
                  Yêu cầu: <strong>{n.serviceName}</strong> × {n.quantity}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                  <span><ClockCircleOutlined style={{ marginRight: 4 }} />{fmtTime(n.createdAt)}</span>
                  <span>HĐ #{n.invoiceId}</span>
                </div>
              </div>

              {/* Amount + action */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#f59e0b' }}>{fmt(n.totalPrice)}</span>
                {!n.isRead && (
                  <button
                    onClick={() => markRead(n.id)}
                    disabled={marking === n.id}
                    style={{
                      background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                      color: '#22c55e', borderRadius: 6, padding: '4px 10px',
                      cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    }}
                  >
                    {marking === n.id ? '...' : '✓ Đã nhận'}
                  </button>
                )}
                {n.isRead && (
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>Đã đọc</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
