import { useState, useEffect } from "react"
import type { ReactNode } from "react"
import {
  HistoryOutlined, CheckCircleOutlined, HomeOutlined,
  SearchOutlined, EyeOutlined, FileTextOutlined, LoadingOutlined,
} from "@ant-design/icons"
import "../assets/css/Profile/BookingHistory.css"
import Header from "../shared/Header"
import Footer from "../shared/Fooder"
import { apiGetMyBookings } from "../services/BookingService"

interface Booking {
  id: number
  roomTypeId: number
  roomTypeName?: string
  fromDate?: string
  toDate?: string
  deposit?: number
  status: string
  createdAt?: string
}

/* Chỉ 2 trạng thái hiển thị: Đã đặt / Đã kết thúc */
const toDisplayStatus = (s: string): 'booked' | 'ended' => {
  const l = (s ?? '').toLowerCase()
  if (l === 'completed' || l === 'checkedout') return 'ended'
  return 'booked'
}

const STATUS_CFG: Record<'booked' | 'ended', { label: string; icon: ReactNode; cls: string }> = {
  booked: { label: 'Đã đặt',      icon: <HomeOutlined />,        cls: 'upcoming' },
  ended:  { label: 'Đã kết thúc', icon: <CheckCircleOutlined />, cls: 'completed' },
}

function calcNights(from?: string, to?: string) {
  if (!from || !to) return 0
  return Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000))
}
function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN')
}

export default function BookingHistory() {
  const [filter, setFilter]     = useState<'all' | 'booked' | 'ended'>('all')
  const [search, setSearch]     = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    setLoading(true)
    apiGetMyBookings()
      .then((data: any[]) => { setBookings(Array.isArray(data) ? data : []); setError('') })
      .catch(() => setError('Không thể tải lịch sử đặt phòng.'))
      .finally(() => setLoading(false))
  }, [])

  const bookedCount = bookings.filter(b => toDisplayStatus(b.status) === 'booked').length
  const endedCount  = bookings.filter(b => toDisplayStatus(b.status) === 'ended').length

  const filtered = bookings.filter(b => {
    const ds = toDisplayStatus(b.status)
    const matchFilter = filter === 'all' || ds === filter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      String(b.id).includes(q) ||
      (b.roomTypeName ?? '').toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  return (
    <>
      <Header />
      <div className="bh-page">
        <div className="bh-header">
          <div className="container">
            <h1 className="bh-title"><HistoryOutlined /> Lịch Sử Đặt Phòng</h1>
            <p className="bh-sub">Tổng {bookings.length} lần đặt phòng</p>
          </div>
        </div>

        <div className="container bh-body">
          {/* Stats */}
          <div className="bh-stats">
            {[
              { label: 'Tổng đặt phòng', value: bookings.length, color: '#3b82f6' },
              { label: 'Đã đặt / Đang ở', value: bookedCount,    color: '#8b5cf6' },
              { label: 'Đã kết thúc',     value: endedCount,     color: '#22c55e' },
            ].map(s => (
              <div key={s.label} className="bh-stat-card">
                <div className="bh-stat-num" style={{ color: s.color }}>{s.value}</div>
                <div className="bh-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bh-filters">
            <div className="bh-filter-tabs">
              {([
                { key: 'all',    label: 'Tất cả' },
                { key: 'booked', label: 'Đã đặt' },
                { key: 'ended',  label: 'Đã kết thúc' },
              ] as const).map(t => (
                <button
                  key={t.key}
                  className={`bh-filter-tab${filter === t.key ? ' active' : ''}`}
                  onClick={() => setFilter(t.key)}
                >{t.label}</button>
              ))}
            </div>
            <div className="bh-search-wrap">
              <SearchOutlined className="bh-search-icon" />
              <input
                className="bh-search-input"
                placeholder="Tìm mã đặt phòng, tên phòng..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="bh-empty"><LoadingOutlined style={{ fontSize: 32 }} /></div>
          ) : error ? (
            <div className="bh-empty"><p style={{ color: '#ef4444' }}>{error}</p></div>
          ) : filtered.length === 0 ? (
            <div className="bh-empty">
              <div className="bh-empty-icon"><FileTextOutlined /></div>
              <p>Không tìm thấy đặt phòng nào</p>
            </div>
          ) : (
            <div className="bh-table-wrap">
              <table className="bh-table">
                <thead>
                  <tr>
                    <th>Mã đặt</th>
                    <th>Loại phòng</th>
                    <th>Nhận phòng</th>
                    <th>Trả phòng</th>
                    <th>Số đêm</th>
                    <th>Cọc</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => {
                    const ds  = toDisplayStatus(b.status)
                    const st  = STATUS_CFG[ds]
                    const nights = calcNights(b.fromDate, b.toDate)
                    return (
                      <tr key={b.id}>
                        <td><span className="bh-id">#{b.id}</span></td>
                        <td><div className="bh-room-name">{b.roomTypeName ?? `Loại #${b.roomTypeId}`}</div></td>
                        <td className="bh-date">{fmtDate(b.fromDate)}</td>
                        <td className="bh-date">{fmtDate(b.toDate)}</td>
                        <td className="bh-nights">{nights > 0 ? `${nights} đêm` : '—'}</td>
                        <td>
                          {b.deposit != null && b.deposit > 0
                            ? <span className="bh-total">{b.deposit.toLocaleString('vi-VN')}₫</span>
                            : <span style={{ color: 'rgba(255,255,255,0.3)' }}>Không cọc</span>}
                        </td>
                        <td>
                          <span className={`bh-status ${st.cls}`}>
                            {st.icon} {st.label}
                          </span>
                        </td>
                        <td>
                          <button className="bh-action-btn view" title="Chi tiết">
                            <EyeOutlined />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
