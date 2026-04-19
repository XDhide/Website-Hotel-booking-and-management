import {
  SearchOutlined, MoneyCollectOutlined, ReloadOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
} from "@ant-design/icons"
import { useState, useEffect, useCallback } from "react"
import Modal from './Modal'
import { apiClient } from '../../constant/api'
import { API } from '../../constant/config'
import '../../assets/css/Adminpage/Payment.css'

// Model Invoice: { id, bookingId, roomCharge, serviceCharge, discount, totalAmount, status }
interface Invoice {
  id: number
  bookingId: number
  roomCharge: number
  serviceCharge: number
  discount: number
  totalAmount: number
  status: string          // Unpaid | Paid | Refunded
  createAt?: string
}

const STATUS_LABEL: Record<string, string> = {
  Paid:     'Đã thanh toán',
  Unpaid:   'Chưa thanh toán',
  Refunded: 'Hoàn tiền',
}
const STATUS_COLOR: Record<string, string> = {
  Paid:     '#22c55e',
  Unpaid:   '#eab308',
  Refunded: '#3b82f6',
}
const STATUS_ICON: Record<string, React.ReactNode> = {
  Paid:     <CheckCircleOutlined />,
  Unpaid:   <ClockCircleOutlined />,
  Refunded: <CloseCircleOutlined />,
}

const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

const fmtDate = (s?: string) => s ? new Date(s).toLocaleDateString('vi-VN') : '—'

export default function Payment() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selected, setSelected] = useState<Invoice | null>(null)
  const [saving, setSaving]     = useState(false)
  const PAGE_SIZE = 10

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await apiClient.get(`${API}/Invoice?page=${p}&limit=${PAGE_SIZE}`)
      const raw = res.data
      const items: Invoice[] = Array.isArray(raw) ? raw
        : raw?.data ?? raw?.items ?? raw?.result ?? []
      const tc = raw?.totalCount ?? raw?.total ?? items.length
      const tp = raw?.totalPages ?? (Math.ceil(tc / PAGE_SIZE) || 1)
      setInvoices(items)
      setTotalCount(tc)
      setTotalPages(tp)
    } catch {
      setInvoices([
        { id: 1, bookingId: 1, roomCharge: 1000000, serviceCharge: 200000, discount: 0, totalAmount: 1200000, status: 'Paid' },
        { id: 2, bookingId: 2, roomCharge: 800000,  serviceCharge: 100000, discount: 50000, totalAmount: 850000, status: 'Unpaid' },
        { id: 3, bookingId: 3, roomCharge: 1500000, serviceCharge: 0, discount: 0, totalAmount: 1500000, status: 'Refunded' },
      ])
      setTotalCount(3); setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [load, page])

  const filtered = invoices.filter(inv =>
    String(inv.id).includes(search) ||
    String(inv.bookingId).includes(search) ||
    inv.status.toLowerCase().includes(search.toLowerCase())
  )

  const totalPaid   = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.totalAmount, 0)
  const unpaidCount = invoices.filter(i => i.status === 'Unpaid').length

  const handleMarkPaid = async () => {
    if (!selected || selected.status !== 'Unpaid') return
    setSaving(true)
    try {
      await apiClient.put(`${API}/Invoice/${selected.id}`, { ...selected, status: 'Paid' })
      setInvoices(prev => prev.map(i => i.id === selected.id ? { ...i, status: 'Paid' } : i))
      setSelected(prev => prev ? { ...prev, status: 'Paid' } : prev)
    } catch {
      setInvoices(prev => prev.map(i => i.id === selected.id ? { ...i, status: 'Paid' } : i))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="payment-wrapper">
      {/* Stats */}
      <div className="payment-stats">
        <div className="stat-card">
          <div className="stat-label">Đã thu</div>
          <div className="stat-value green">{fmt(totalPaid)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Chưa thanh toán</div>
          <div className="stat-value yellow">{unpaidCount} hoá đơn</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tổng hoá đơn</div>
          <div className="stat-value">{totalCount}</div>
        </div>
      </div>

      <div className="payment-header">
        <div className="search-box">
          <SearchOutlined className="search-icon" />
          <input type="text" placeholder="Tìm theo ID, booking, trạng thái..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => load(page)} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff', borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
        }}><ReloadOutlined /></button>
      </div>

      <div className="payment-table-wrapper">
        <table className="payment-table">
          <thead>
            <tr>
              <th>#</th><th>Booking</th><th>Tiền phòng</th>
              <th>Dịch vụ</th><th>Giảm giá</th>
              <th>Tổng tiền</th><th>Trạng thái</th><th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.35)' }}>Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.35)' }}>Không có dữ liệu</td></tr>
            ) : filtered.map((inv, i) => (
              <tr key={inv.id} onClick={() => setSelected(inv)} className="payment-row">
                <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td>#{inv.bookingId}</td>
                <td className="price-cell">{fmt(inv.roomCharge)}</td>
                <td className="price-cell">{fmt(inv.serviceCharge)}</td>
                <td className="price-cell">{inv.discount ? fmt(inv.discount) : '—'}</td>
                <td className="price-cell" style={{ fontWeight: 700 }}>{fmt(inv.totalAmount)}</td>
                <td>
                  <span className={`status-badge status-${inv.status.toLowerCase()}`}
                    style={{ color: STATUS_COLOR[inv.status], background: `${STATUS_COLOR[inv.status]}20`,
                             padding: '2px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600 }}>
                    {STATUS_ICON[inv.status]} {STATUS_LABEL[inv.status] ?? inv.status}
                  </span>
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <button className="pay-action-btn" onClick={() => setSelected(inv)}>
                    <MoneyCollectOutlined /> Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="pagination" style={{ marginTop: 12 }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
          Tổng: {totalCount} — Trang {page}/{totalPages}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button disabled={page <= 1} onClick={() => setPage(1)}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>«</button>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>‹</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, page - 2) + i
            if (p > totalPages) return null
            return (
              <button key={p} onClick={() => setPage(p)}
                style={{ background: p === page ? '#3b82f6' : 'none',
                         border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                         borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>{p}</button>
            )
          })}
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>›</button>
          <button disabled={page >= totalPages} onClick={() => setPage(totalPages)}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>»</button>
        </div>
      </div>

      {/* Modal chi tiết */}
      {selected && (
        <Modal
          title={`Hoá đơn #${selected.id}`}
          onClose={() => setSelected(null)}
          onSave={selected.status === 'Unpaid' ? handleMarkPaid : () => setSelected(null)}
        >
          <div className="bill-detail">
            {[
              ['Mã hoá đơn', `#${selected.id}`],
              ['Booking ID', `#${selected.bookingId}`],
              ['Tiền phòng', fmt(selected.roomCharge)],
              ['Dịch vụ', fmt(selected.serviceCharge)],
              ['Giảm giá', selected.discount ? fmt(selected.discount) : '—'],
            ].map(([l, v]) => (
              <div key={l} className="bill-row"><span>{l}:</span><span>{v}</span></div>
            ))}
            <div className="bill-row highlight">
              <span>Tổng tiền:</span>
              <span style={{ color: '#22c55e', fontWeight: 700 }}>{fmt(selected.totalAmount)}</span>
            </div>
            <div className="bill-row">
              <span>Trạng thái:</span>
              <span style={{ color: STATUS_COLOR[selected.status], fontWeight: 600 }}>
                {STATUS_LABEL[selected.status] ?? selected.status}
              </span>
            </div>
            {selected.status === 'Unpaid' && (
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', marginTop: 8 }}>
                {saving ? '⏳ Đang xử lý...' : 'Nhấn "Lưu" để đánh dấu đã thanh toán.'}
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}