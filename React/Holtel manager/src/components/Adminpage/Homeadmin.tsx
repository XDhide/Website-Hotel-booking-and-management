import { useState, useEffect, useCallback } from 'react'
import {
  PlusOutlined, SearchOutlined, ReloadOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ShoppingCartOutlined,
  TagOutlined, FileTextOutlined,
} from '@ant-design/icons'
import Modal from './Modal'
import { apiClient } from '../../constant/api'
import { API } from '../../constant/config'

/* ── Types ─────────────────────────────────────────────────── */
interface Invoice {
  id: number
  bookingId: number
  roomCharge: number
  serviceCharge: number
  discount: number
  totalAmount: number
  status: string        // Unpaid | Paid | Refunded
}

interface Room {
  id: number
  roomNumber: string
  currentStatus: string // Available | Occupied | Maintenance | Reserved
  roomTypeId: number
}

interface Service {
  id: number
  name: string
  serviceType: string
  price: number
  unit: string
}

interface Discount {
  id: number
  name: string
  discountType: string   // Percentage | Fixed
  discountValue: number
  isActive: boolean
}

interface CartService { service: Service; qty: number }

type Step = 'main' | 'pickRoom' | 'booking' | 'payment'

const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

const ROOM_COLOR: Record<string, string> = {
  Available: '#22c55e', Occupied: '#ef4444',
  Maintenance: '#eab308', Reserved: '#3b82f6',
}
const ROOM_LABEL: Record<string, string> = {
  Available: 'Trống', Occupied: 'Đang dùng',
  Maintenance: 'Bảo trì', Reserved: 'Đã đặt',
}

/* ── Component ─────────────────────────────────────────────── */
export default function HomeAdmin() {
  /* unpaid invoices */
  const [invoices, setInvoices]   = useState<Invoice[]>([])
  const [loadingInv, setLoadingInv] = useState(true)
  const [invPage, setInvPage]     = useState(1)
  const [invTotal, setInvTotal]   = useState(0)
  const [invTotalPg, setInvTotalPg] = useState(1)
  const [invSearch, setInvSearch] = useState('')

  /* catalog */
  const [rooms, setRooms]         = useState<Room[]>([])
  const [services, setServices]   = useState<Service[]>([])
  const [discounts, setDiscounts] = useState<Discount[]>([])

  /* wizard state */
  const [step, setStep]           = useState<Step>('main')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [cart, setCart]           = useState<CartService[]>([])
  const [selDiscount, setSelDiscount] = useState<Discount | null>(null)
  const [checkIn, setCheckIn]     = useState('')
  const [checkOut, setCheckOut]   = useState('')
  const [guests, setGuests]       = useState(1)
  const [special, setSpecial]     = useState('')
  const [bookingId, setBookingId] = useState<number | null>(null)
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null)

  /* selected invoice for pay */
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null)
  const [paying, setPaying]         = useState(false)

  /* ── Loaders ─────────────────────────────────────────── */
  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok }); setTimeout(() => setToast(null), 3000)
  }

  const loadInvoices = useCallback(async (p: number) => {
    setLoadingInv(true)
    try {
      const res = await apiClient.get(`${API}/Invoice?page=${p}&limit=10`)
      const raw = res.data
      const all: Invoice[] = Array.isArray(raw) ? raw : raw?.data ?? []
      // Lọc Unpaid client-side (server trả tất cả)
      const unpaid = all.filter(i => i.status === 'Unpaid')
      setInvoices(unpaid)
      setInvTotal(raw?.totalCount ?? all.length)
      setInvTotalPg(raw?.totalPages ?? 1)
    } catch {
      setInvoices([
        { id: 1, bookingId: 1, roomCharge: 800000, serviceCharge: 200000, discount: 0, totalAmount: 1000000, status: 'Unpaid' },
        { id: 2, bookingId: 2, roomCharge: 1200000, serviceCharge: 0, discount: 50000, totalAmount: 1150000, status: 'Unpaid' },
      ])
    } finally { setLoadingInv(false) }
  }, [])

  const loadCatalog = useCallback(async () => {
    try {
      const [rRes, sRes, dRes] = await Promise.all([
        apiClient.get(`${API}/room?page=1&limit=100`),
        apiClient.get(`${API}/Service?page=1&limit=100`),
        apiClient.get(`${API}/Discount?page=1&limit=100`),
      ])
      const norm = (r: any) => Array.isArray(r.data) ? r.data : r.data?.data ?? []
      setRooms(norm(rRes))
      setServices(norm(sRes))
      setDiscounts(norm(dRes).filter((d: Discount) => d.isActive))
    } catch {}
  }, [])

  useEffect(() => { loadInvoices(invPage) }, [loadInvoices, invPage])
  useEffect(() => { loadCatalog() }, [loadCatalog])

  /* ── Tính tiền ────────────────────────────────────────── */
  const calcServiceTotal = () =>
    cart.reduce((s, c) => s + c.service.price * c.qty, 0)

  const calcDiscount = (roomCharge: number, svcTotal: number) => {
    if (!selDiscount) return 0
    const base = roomCharge + svcTotal
    if (selDiscount.discountType === 'Percentage')
      return Math.round(base * selDiscount.discountValue / 100)
    return selDiscount.discountValue
  }

  /* Ước tính tiền phòng (chưa có rate nên ước từ ngày) */
  const estimateRoomCharge = () => {
    if (!checkIn || !checkOut) return 0
    const days = Math.max(1, Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
    ))
    return days * 500000 // placeholder, server sẽ tính lại
  }

  /* ── Tạo Booking + Invoice ──────────────────────────── */
  const handleCreateBookingAndInvoice = async () => {
    if (!selectedRoom || !checkIn || !checkOut) {
      showToast('Vui lòng chọn phòng và ngày', false); return
    }
    setSaving(true)
    try {
      // 1. Tạo booking
      const bRes = await apiClient.post(`${API}/Booking`, {
        roomId: selectedRoom.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: guests,
        specialRequests: special || undefined,
      })
      const bId: number = bRes.data?.id ?? bRes.data?.Id
      setBookingId(bId)

      const roomCharge   = bRes.data?.totalPrice ?? estimateRoomCharge()
      const svcTotal     = calcServiceTotal()
      const discountAmt  = calcDiscount(roomCharge, svcTotal)

      // 2. Tạo Invoice
      await apiClient.post(`${API}/Invoice`, {
        bookingId: bId,
        roomCharge,
        serviceCharge: svcTotal,
        discount: discountAmt,
        totalAmount: roomCharge + svcTotal - discountAmt,
        status: 'Unpaid',
      })

      showToast(`Tạo booking #${bId} và hoá đơn thành công!`)
      resetWizard()
      await loadInvoices(1)
    } catch (e: any) {
      showToast(e?.response?.data || 'Tạo thất bại', false)
    } finally { setSaving(false) }
  }

  /* ── Thanh toán hoá đơn có sẵn ─────────────────────── */
  const handlePayInvoice = async () => {
    if (!payInvoice) return
    setPaying(true)
    try {
      await apiClient.put(`${API}/Invoice/${payInvoice.id}`, {
        ...payInvoice, status: 'Paid',
      })
      showToast(`Hoá đơn #${payInvoice.id} đã thanh toán!`)
      setPayInvoice(null)
      await loadInvoices(invPage)
    } catch (e: any) {
      showToast(e?.response?.data || 'Thanh toán thất bại', false)
    } finally { setPaying(false) }
  }

  const resetWizard = () => {
    setStep('main'); setSelectedRoom(null); setCart([])
    setSelDiscount(null); setCheckIn(''); setCheckOut('')
    setGuests(1); setSpecial(''); setBookingId(null)
  }

  const addService = (svc: Service) => {
    setCart(prev => {
      const ex = prev.find(c => c.service.id === svc.id)
      if (ex) return prev.map(c => c.service.id === svc.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { service: svc, qty: 1 }]
    })
  }

  const removeService = (id: number) =>
    setCart(prev => prev.filter(c => c.service.id !== id))

  const filteredInv = invoices.filter(inv =>
    String(inv.bookingId).includes(invSearch) || String(inv.id).includes(invSearch)
  )

  const roomCharge  = estimateRoomCharge()
  const svcTotal    = calcServiceTotal()
  const discountAmt = calcDiscount(roomCharge, svcTotal)
  const grandTotal  = roomCharge + svcTotal - discountAmt

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div style={{ padding: '0 0 40px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem',
          background: toast.ok ? '#166534' : '#7f1d1d', color: '#fff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>{toast.msg}</div>
      )}

      {/* ── Header stats ── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Chưa thanh toán', val: invoices.length, color: '#eab308', icon: <ClockCircleOutlined /> },
          { label: 'Phòng trống', val: rooms.filter(r => r.currentStatus === 'Available').length, color: '#22c55e', icon: <CheckCircleOutlined /> },
          { label: 'Tổng nợ', val: fmt(invoices.reduce((s, i) => s + i.totalAmount, 0)), color: '#ef4444', icon: <FileTextOutlined /> },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${s.color}33`, borderRadius: 12, padding: '14px 18px',
          }}>
            <div style={{ color: s.color, fontSize: '1.5rem', fontWeight: 700 }}>{s.val}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 2 }}>
              {s.icon} {s.label}
            </div>
          </div>
        ))}
        <button onClick={() => setStep('pickRoom')} style={{
          background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff',
          border: 'none', borderRadius: 12, padding: '14px 24px',
          cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <PlusOutlined /> Tạo Booking mới
        </button>
      </div>

      {/* ── Danh sách hoá đơn chưa thanh toán ── */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
            📋 Hoá đơn chưa thanh toán
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '6px 12px',
            }}>
              <SearchOutlined style={{ color: 'rgba(255,255,255,0.4)' }} />
              <input value={invSearch} onChange={e => setInvSearch(e.target.value)}
                placeholder="Tìm booking ID..."
                style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', width: 120, fontSize: '0.88rem' }} />
            </div>
            <button onClick={() => loadInvoices(invPage)} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
            }}><ReloadOutlined /></button>
          </div>
        </div>

        {loadingInv ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Đang tải...</div>
        ) : filteredInv.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            🎉 Không có hoá đơn chưa thanh toán
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['#', 'Booking', 'Tiền phòng', 'Dịch vụ', 'Giảm giá', 'Tổng tiền', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textAlign: 'left', fontSize: '0.8rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredInv.map((inv, i) => (
                <tr key={inv.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)' }}>{(invPage - 1) * 10 + i + 1}</td>
                  <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 600 }}>#{inv.bookingId}</td>
                  <td style={{ padding: '12px 16px', color: '#fff' }}>{fmt(inv.roomCharge)}</td>
                  <td style={{ padding: '12px 16px', color: '#fff' }}>{inv.serviceCharge ? fmt(inv.serviceCharge) : '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#22c55e' }}>{inv.discount ? `-${fmt(inv.discount)}` : '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 700 }}>{fmt(inv.totalAmount)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => setPayInvoice(inv)} style={{
                      background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                      color: '#4ade80', borderRadius: 6, padding: '5px 12px',
                      cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                    }}>
                      <CheckCircleOutlined /> Thanh toán
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Phân trang */}
        {invTotalPg > 1 && (
          <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 6, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {Array.from({ length: invTotalPg }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setInvPage(p)} style={{
                background: p === invPage ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
              }}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* ── WIZARD: Chọn phòng ── */}
      {step === 'pickRoom' && (
        <Modal title="Chọn phòng" onClose={resetWizard} onSave={() => selectedRoom && setStep('booking')}>
          <div style={{ marginBottom: 12, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            Chọn phòng trống hoặc đã đặt để tạo booking mới
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(100px,1fr))', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
            {rooms.filter(r => r.currentStatus === 'Available' || r.currentStatus === 'Reserved').map(room => (
              <div key={room.id} onClick={() => setSelectedRoom(room)}
                style={{
                  padding: '10px 8px', borderRadius: 8, textAlign: 'center', cursor: 'pointer',
                  border: `2px solid ${selectedRoom?.id === room.id ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                  background: selectedRoom?.id === room.id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                  transition: 'all 0.15s',
                }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{room.roomNumber}</div>
                <div style={{ fontSize: '0.7rem', color: ROOM_COLOR[room.currentStatus], marginTop: 4 }}>
                  ● {ROOM_LABEL[room.currentStatus]}
                </div>
              </div>
            ))}
          </div>
          {selectedRoom && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(59,130,246,0.08)', borderRadius: 8, color: '#60a5fa', fontSize: '0.85rem' }}>
              ✓ Đã chọn: Phòng {selectedRoom.roomNumber}
            </div>
          )}
        </Modal>
      )}

      {/* ── WIZARD: Thông tin booking + dịch vụ + voucher ── */}
      {step === 'booking' && selectedRoom && (
        <Modal title={`Booking — Phòng ${selectedRoom.roomNumber}`}
          onClose={resetWizard} onSave={handleCreateBookingAndInvoice}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Ngày */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['checkIn', 'Ngày nhận phòng', checkIn, setCheckIn],
                ['checkOut', 'Ngày trả phòng', checkOut, setCheckOut]].map(([, lbl, val, set]: any) => (
                <div key={lbl} className="form-group">
                  <label>{lbl}</label>
                  <input type="date" value={val} onChange={e => set(e.target.value)} />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label>Số khách</label>
              <input type="number" min={1} value={guests} onChange={e => setGuests(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Ghi chú</label>
              <textarea rows={2} value={special} onChange={e => setSpecial(e.target.value)} placeholder="Yêu cầu đặc biệt..." />
            </div>

            {/* Dịch vụ */}
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShoppingCartOutlined /> THÊM DỊCH VỤ
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 140, overflowY: 'auto' }}>
                {services.map(svc => {
                  const inCart = cart.find(c => c.service.id === svc.id)
                  return (
                    <div key={svc.id} onClick={() => addService(svc)} style={{
                      padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem',
                      border: `1px solid ${inCart ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
                      background: inCart ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                      color: inCart ? '#60a5fa' : 'rgba(255,255,255,0.7)',
                    }}>
                      {svc.name} — {fmt(svc.price)}/{svc.unit}
                      {inCart && <span style={{ marginLeft: 6, fontWeight: 700 }}>×{inCart.qty}</span>}
                    </div>
                  )
                })}
              </div>
              {cart.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {cart.map(c => (
                    <div key={c.service.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
                      <span>{c.service.name} ×{c.qty}</span>
                      <span style={{ display: 'flex', gap: 10 }}>
                        <span>{fmt(c.service.price * c.qty)}</span>
                        <button onClick={() => removeService(c.service.id)}
                          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Voucher */}
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <TagOutlined /> PHIẾU GIẢM GIÁ
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {discounts.map(d => (
                  <div key={d.id} onClick={() => setSelDiscount(selDiscount?.id === d.id ? null : d)}
                    style={{
                      padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem',
                      border: `1px solid ${selDiscount?.id === d.id ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                      background: selDiscount?.id === d.id ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.03)',
                      color: selDiscount?.id === d.id ? '#4ade80' : 'rgba(255,255,255,0.7)',
                    }}>
                    {d.name} — {d.discountType === 'Percentage' ? `${d.discountValue}%` : fmt(d.discountValue)}
                  </div>
                ))}
                {discounts.length === 0 && (
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>Không có voucher khả dụng</span>
                )}
              </div>
            </div>

            {/* Tổng kết */}
            {checkIn && checkOut && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: 8 }}>DỰ TÍNH</div>
                {[
                  ['Tiền phòng (ước tính)', fmt(roomCharge)],
                  ['Dịch vụ', fmt(svcTotal)],
                  ['Giảm giá', selDiscount ? `-${fmt(discountAmt)}` : '—'],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{l}</span>
                    <span style={{ color: '#fff' }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ color: '#fff', fontWeight: 700 }}>Tổng cộng</span>
                  <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '1.05rem' }}>{fmt(grandTotal)}</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: 6 }}>
                  * Giá phòng chính xác sẽ được tính từ server
                </div>
              </div>
            )}

            {saving && <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>⏳ Đang tạo booking và hoá đơn...</div>}
          </div>
        </Modal>
      )}

      {/* ── Modal thanh toán hoá đơn có sẵn ── */}
      {payInvoice && (
        <Modal title={`Thanh toán hoá đơn #${payInvoice.id}`}
          onClose={() => setPayInvoice(null)} onSave={handlePayInvoice}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Mã hoá đơn', `#${payInvoice.id}`],
              ['Booking ID', `#${payInvoice.bookingId}`],
              ['Tiền phòng', fmt(payInvoice.roomCharge)],
              ['Dịch vụ', payInvoice.serviceCharge ? fmt(payInvoice.serviceCharge) : '—'],
              ['Giảm giá', payInvoice.discount ? fmt(payInvoice.discount) : '—'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>{l}</span>
                <span style={{ color: '#fff', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span style={{ color: '#fff', fontWeight: 700 }}>Tổng tiền</span>
              <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '1.1rem' }}>{fmt(payInvoice.totalAmount)}</span>
            </div>
            {paying && <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>⏳ Đang xử lý...</div>}
          </div>
        </Modal>
      )}
    </div>
  )
}