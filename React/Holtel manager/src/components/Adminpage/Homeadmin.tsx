import { useState, useEffect, useCallback } from 'react'
import {
  PlusOutlined, SearchOutlined, ReloadOutlined, LoadingOutlined,
  CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined,
  HomeOutlined, CheckOutlined, LoginOutlined,
} from '@ant-design/icons'
import Modal from './Modal'
import { BookingService } from '../../services/BookingService'
import { apiSearch as apiSearchInvoice } from '../../services/InvoiceService'
import { apiGetAllRoomTypes } from '../../services/RoomTypeService'
import { CheckInOutService } from '../../services/CheckInOutService'
import '../../assets/css/Adminpage/HomeAdmin.css'

interface Booking {
  id: number; userId: string; roomTypeId: number; roomTypeName?: string
  fromDate: string; toDate: string; status: string; createdAt: string
  deposit?: number; roomNumber?: string
}
interface Invoice {
  invoiceId: number; roomUseId: number; subTotal: number
  discountAmount: number; surchargeAmount: number; finalAmount: number
  paymentStatus: string; paymentMethod: string; note?: string
}
interface RoomTypeItem {
  id: number; name: string; capacity: string; availableRooms: number; totalRooms: number
  images: { imageUrl: string }[]
}

const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v ?? 0)
const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString('vi-VN') : '—'

function getCurrentUserId(): string {
  try {
    const token = localStorage.getItem('hotel_token') ?? ''
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload?.sub ?? payload?.nameid ?? payload?.userId ?? ''
  } catch { return '' }
}

type Step = 'main' | 'pickRoom' | 'booking'

const BOOKING_STATUS_COLOR: Record<string, string> = {
  Pending: '#f59e0b', Confirmed: '#3b82f6', CheckedIn: '#22c55e',
  CheckedOut: '#6b7280', Cancelled: '#ef4444',
}
const BOOKING_STATUS_LABEL: Record<string, string> = {
  Pending: 'Chờ xác nhận', Confirmed: 'Đã xác nhận', CheckedIn: 'Đang ở',
  CheckedOut: 'Đã trả phòng', Cancelled: 'Đã hủy',
}

export default function HomeAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingBk, setLoadingBk] = useState(true)
  const [bkSearch, setBkSearch] = useState('')
  const [bkPage, setBkPage] = useState(1)
  const [bkTotalPg, setBkTotalPg] = useState(1)
  const [bkTab, setBkTab] = useState<'pending' | 'active' | 'all'>('pending')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loadingInv, setLoadingInv] = useState(true)
  const [invSearch, setInvSearch] = useState('')
  const [roomTypes, setRoomTypes] = useState<RoomTypeItem[]>([])
  const [loadingCat, setLoadingCat] = useState(true)
  const [step, setStep] = useState<Step>('main')
  const [selectedRT, setSelectedRT] = useState<RoomTypeItem | null>(null)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [saving, setSaving] = useState(false)
  const [rtSearch, setRtSearch] = useState('')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [checkInBk, setCheckInBk] = useState<Booking | null>(null)
  const [doingCheckIn, setDoingCheckIn] = useState(false)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok }); setTimeout(() => setToast(null), 3500)
  }
  const today = new Date().toISOString().split('T')[0]

  const loadBookings = useCallback(async (p: number) => {
    setLoadingBk(true)
    try {
      const raw = await BookingService.getAll(p, 15)
      const items: Booking[] = Array.isArray(raw) ? raw : raw?.data ?? []
      setBookings(items)
      setBkTotalPg(raw?.totalPages ?? 1)
    } catch { setBookings([]) }
    finally { setLoadingBk(false) }
  }, [])

  const loadInvoices = useCallback(async () => {
    setLoadingInv(true)
    try {
      const raw = await apiSearchInvoice(1, 50)
      const all: Invoice[] = Array.isArray(raw) ? raw : raw?.data ?? []
      setInvoices(all.filter(i => i.paymentStatus === 'Unpaid'))
    } catch { setInvoices([]) }
    finally { setLoadingInv(false) }
  }, [])

  const loadCatalog = useCallback(async () => {
    setLoadingCat(true)
    try {
      const rtRaw = await apiGetAllRoomTypes(1, 100)
      const rtList = Array.isArray(rtRaw) ? rtRaw : rtRaw?.data ?? []
      setRoomTypes(rtList.map((rt: any) => ({
        id: rt.id ?? rt.Id,
        name: rt.name ?? rt.Name,
        capacity: rt.capacity ?? '',
        availableRooms: rt.availableRooms ?? 0,
        totalRooms: rt.totalRooms ?? 0,
        images: rt.images ?? [],
      })))
    } catch { }
    finally { setLoadingCat(false) }
  }, [])

  useEffect(() => { loadBookings(bkPage) }, [loadBookings, bkPage])
  useEffect(() => { loadInvoices() }, [loadInvoices])
  useEffect(() => { loadCatalog() }, [loadCatalog])

  const handleCreateBooking = async () => {
    if (!selectedRT) { showToast('Vui lòng chọn loại phòng', false); return }
    if (!checkIn) { showToast('Vui lòng chọn ngày nhận phòng', false); return }
    if (!checkOut) { showToast('Vui lòng chọn ngày trả phòng', false); return }
    if (new Date(checkOut) <= new Date(checkIn)) { showToast('Ngày trả phòng phải sau ngày nhận phòng', false); return }
    setSaving(true)
    try {
      const userId = getCurrentUserId()
      const bRes = await BookingService.adminCreate({
        userId, roomTypeId: selectedRT.id, deposit: 0,
        fromDate: checkIn, toDate: checkOut, status: 'Pending',
        createdAt: new Date().toISOString(),
      })
      const bId: number = bRes?.id ?? bRes?.Id ?? 0
      showToast(`Booking #${bId} đã tạo! Chọn booking và nhấn Check-in để xác nhận khách vào phòng.`)
      resetWizard()
      await loadBookings(1)
      await loadCatalog()
    } catch (e: any) {
      showToast(e?.message || 'Tạo booking thất bại', false)
    } finally { setSaving(false) }
  }

  const handleCheckIn = async () => {
    if (!checkInBk) return
    setDoingCheckIn(true)
    try {
      await CheckInOutService.checkInByBooking(checkInBk.id)
      showToast(`Check-in booking #${checkInBk.id} thành công! Hóa đơn đã được tạo.`)
      setCheckInBk(null)
      await loadBookings(bkPage)
      await loadInvoices()
    } catch (e: any) {
      showToast(e?.message || 'Check-in thất bại', false)
    } finally { setDoingCheckIn(false) }
  }

  const resetWizard = () => {
    setStep('main'); setSelectedRT(null); setCheckIn(''); setCheckOut(''); setGuests(1); setRtSearch('')
  }

  const availableRTs = roomTypes.filter(rt =>
    rt.availableRooms > 0 && rt.name.toLowerCase().includes(rtSearch.toLowerCase()))

  const filteredBk = bookings.filter(b => {
    const matchTab = bkTab === 'all' ||
      (bkTab === 'pending' && ['Pending', 'Confirmed'].includes(b.status)) ||
      (bkTab === 'active' && b.status === 'CheckedIn')
    const q = bkSearch.toLowerCase()
    return matchTab && (!q || String(b.id).includes(q) || (b.roomTypeName ?? '').toLowerCase().includes(q))
  })

  const filteredInv = invoices.filter(inv =>
    String(inv.roomUseId).includes(invSearch) || String(inv.invoiceId).includes(invSearch))

  const pendingCount = bookings.filter(b => ['Pending', 'Confirmed'].includes(b.status)).length
  const activeCount = bookings.filter(b => b.status === 'CheckedIn').length

  return (
    <div className="ha-container">
      {toast && <div className={`ha-toast ${toast.ok ? 'ok' : 'err'}`}>{toast.msg}</div>}

      <div className="stats-bar">
        {[
          { label: 'Booking chờ xác nhận', val: pendingCount, color: '#f59e0b', icon: <ClockCircleOutlined /> },
          { label: 'Đang ở', val: activeCount, color: '#22c55e', icon: <CheckCircleOutlined /> },
          { label: 'Hoá đơn chưa TT', val: invoices.length, color: '#ef4444', icon: <FileTextOutlined /> },
        ].map(s => (
          <div key={s.label} className="stats-card" style={{ border: `1px solid ${s.color}33` }}>
            <div className="stats-card-value" style={{ color: s.color }}>{s.val}</div>
            <div className="stats-card-label">{s.icon} {s.label}</div>
          </div>
        ))}
        <button onClick={() => setStep('pickRoom')} className="stats-create-btn">
          <PlusOutlined /> Tạo Booking mới
        </button>
      </div>

      <div className="booking-table-wrap">
        <div className="booking-table-header">
          <span className="booking-table-title"><HomeOutlined /> Quản lý Booking</span>
          <div className="booking-table-controls">
            {(['pending', 'active', 'all'] as const).map(t => (
              <button key={t} onClick={() => setBkTab(t)} className={`booking-tab-btn ${bkTab === t ? 'active' : 'inactive'}`}>
                {t === 'pending' ? 'Chờ xác nhận' : t === 'active' ? 'Đang ở' : 'Tất cả'}
              </button>
            ))}
            <div className="booking-search-wrap">
              <SearchOutlined />
              <input value={bkSearch} onChange={e => setBkSearch(e.target.value)} placeholder="Tìm ID / loại phòng..." />
            </div>
            <button className="booking-reload-btn" onClick={() => loadBookings(bkPage)}><ReloadOutlined /></button>
          </div>
        </div>
        {loadingBk ? (
          <div className="booking-table-empty"><LoadingOutlined /> Đang tải...</div>
        ) : filteredBk.length === 0 ? (
          <div className="booking-table-empty">Không có booking nào</div>
        ) : (
          <div className="booking-table-scroll">
            <table className="booking-table">
              <thead>
                <tr>{['#ID', 'Loại phòng', 'Từ ngày', 'Đến ngày', 'Trạng thái', 'Hành động'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredBk.map(bk => (
                  <tr key={bk.id}>
                    <td className="booking-id-td">#{bk.id}</td>
                    <td className="booking-type-td">{bk.roomTypeName ?? `Loại #${bk.roomTypeId}`}</td>
                    <td className="booking-date-td">{fmtDate(bk.fromDate)}</td>
                    <td className="booking-date-td">{fmtDate(bk.toDate)}</td>
                    <td>
                      <span className="booking-status-badge" style={{
                        background: `${BOOKING_STATUS_COLOR[bk.status] ?? '#6b7280'}22`,
                        color: BOOKING_STATUS_COLOR[bk.status] ?? '#9ca3af',
                        border: `1px solid ${BOOKING_STATUS_COLOR[bk.status] ?? '#6b7280'}44`,
                      }}>
                        {BOOKING_STATUS_LABEL[bk.status] ?? bk.status}
                      </span>
                    </td>
                    <td>
                      {['Pending', 'Confirmed'].includes(bk.status) && (
                        <button onClick={() => setCheckInBk(bk)} className="booking-checkin-btn">
                          <LoginOutlined /> Check-in
                        </button>
                      )}
                      {bk.status === 'CheckedIn' && (
                        <span className="ha-muted-sm">Đang ở</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {bkTotalPg > 1 && (
          <div className="booking-table-pagination">
            {Array.from({ length: bkTotalPg }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setBkPage(p)} className={`booking-page-btn ${p === bkPage ? 'active' : 'inactive'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>

      <div className="unpaid-table-wrap">
        <div className="unpaid-table-header">
          <span className="unpaid-table-title"><FileTextOutlined /> Hoá đơn chưa thanh toán</span>
          <div className="ha-flex-gap-8">
            <div className="unpaid-search-wrap">
              <SearchOutlined className="unpaid-search-icon" />
              <input value={invSearch} onChange={e => setInvSearch(e.target.value)} placeholder="Tìm ID..." />
            </div>
            <button onClick={loadInvoices} className="unpaid-reload-btn"><ReloadOutlined /></button>
          </div>
        </div>
        {loadingInv ? (
          <div className="unpaid-table-empty"><LoadingOutlined /> Đang tải...</div>
        ) : filteredInv.length === 0 ? (
          <div className="unpaid-table-empty">
            <CheckCircleOutlined className="unpaid-table-empty-icon" /> Không có hoá đơn chưa thanh toán
          </div>
        ) : (
          <table className="unpaid-table">
            <thead>
              <tr>{['Mã HĐ', 'Tạm tính', 'Phụ thu', 'Giảm giá', 'Tổng tiền', ''].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filteredInv.map(inv => (
                <tr key={inv.invoiceId}>
                  <td className="unpaid-id-td">#{inv.invoiceId}</td>
                  <td className="unpaid-price-td">{fmt(inv.subTotal ?? 0)}</td>
                  <td className="unpaid-price-td">{inv.surchargeAmount ? fmt(inv.surchargeAmount) : '—'}</td>
                  <td className="unpaid-discount-td">{inv.discountAmount ? `-${fmt(inv.discountAmount)}` : '—'}</td>
                  <td className="unpaid-total-td">{fmt(inv.finalAmount ?? 0)}</td>
                  <td className="unpaid-link-td">→ Trang Hoá đơn</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {step === 'pickRoom' && (
        <Modal title="Chọn loại phòng" onClose={resetWizard} onSave={() => selectedRT && setStep('booking')}>
          <div className="bw-modal-col">
            <div className="bw-search-wrap">
              <SearchOutlined />
              <input value={rtSearch} onChange={e => setRtSearch(e.target.value)} placeholder="Tìm loại phòng..." />
            </div>
            {loadingCat ? (
              <div className="bw-loading"><LoadingOutlined /> Đang tải...</div>
            ) : availableRTs.length === 0 ? (
              <div className="bw-empty">
                <HomeOutlined className="bw-empty-icon" />Không có loại phòng nào còn trống
              </div>
            ) : (
              <div className="bw-grid">
                {availableRTs.map(rt => {
                  const cover = rt.images?.[0]?.imageUrl
                  const isSelected = selectedRT?.id === rt.id
                  return (
                    <div key={rt.id} onClick={() => setSelectedRT(rt)} className={`bw-card ${isSelected ? 'active' : ''}`}>
                      {cover
                        ? <img src={cover} alt={rt.name} className="bw-card-img" />
                        : <div className="bw-card-img-placeholder"><HomeOutlined /></div>
                      }
                      <div className="bw-card-body">
                        <div className="bw-card-title">{rt.name}</div>
                        <div className="bw-card-cap">{rt.capacity}</div>
                        <div className="bw-card-avail">
                          <span className="bw-card-avail-dot" />{rt.availableRooms} phòng trống
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {selectedRT && (
              <div className="bw-selected-info">
                <CheckOutlined className="bw-icon-margin" />Đã chọn: {selectedRT.name} ({selectedRT.availableRooms} phòng trống)
              </div>
            )}
          </div>
        </Modal>
      )}

      {step === 'booking' && selectedRT && (
        <Modal title={`Booking — ${selectedRT.name}`} onClose={resetWizard} onSave={handleCreateBooking}>
          <div className="bw-modal-col">
            <div className="bw-selected-info">
              <HomeOutlined className="bw-icon-margin" />{selectedRT.name} — {selectedRT.availableRooms} phòng trống
            </div>
            <div className="bw-info-alert">
              Sau khi tạo booking, vào danh sách booking và nhấn <strong>Check-in</strong> để xác nhận khách vào phòng và tạo hóa đơn.
            </div>
            <div className="bw-form-grid">
              {[
                { lbl: 'Ngày nhận phòng', val: checkIn, set: setCheckIn },
                { lbl: 'Ngày trả phòng', val: checkOut, set: setCheckOut },
              ].map(({ lbl, val, set }: any) => (
                <div key={lbl} className="form-group">
                  <label>{lbl}</label>
                  <input type="date" value={val} min={today} onChange={e => set(e.target.value)} />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label>Số khách</label>
              <input type="number" min={1} max={10} value={guests} onChange={e => setGuests(Number(e.target.value))} />
            </div>
            {saving && (
              <div className="bw-loading-text"><LoadingOutlined className="bw-icon-margin" />Đang tạo booking...</div>
            )}
          </div>
        </Modal>
      )}

      {checkInBk && (
        <Modal title={`Check-in Booking #${checkInBk.id}`} onClose={() => setCheckInBk(null)} onSave={handleCheckIn}>
          <div className="bw-modal-col">
            <div className="bw-checkin-alert">
              <p className="bw-checkin-title"><LoginOutlined className="bw-icon-margin" />Xác nhận Check-in</p>
              <p className="bw-checkin-desc">Khi nhấn <strong>Xác nhận</strong>, hệ thống sẽ:</p>
              <ul className="bw-checkin-list">
                <li>Gán phòng trống cho booking</li>
                <li>Tạo hóa đơn (chưa thanh toán)</li>
                <li>Cập nhật trạng thái → Đang ở</li>
              </ul>
            </div>
            {[
              ['Booking ID', `#${checkInBk.id}`],
              ['Loại phòng', checkInBk.roomTypeName ?? `Loại #${checkInBk.roomTypeId}`],
              ['Từ ngày', fmtDate(checkInBk.fromDate)],
              ['Đến ngày', fmtDate(checkInBk.toDate)],
            ].map(([l, v]) => (
              <div key={l} className="bw-checkin-row">
                <span className="bw-checkin-label">{l}</span>
                <span className="bw-checkin-val">{v}</span>
              </div>
            ))}
            {doingCheckIn && (
              <div className="bw-loading-text"><LoadingOutlined className="bw-icon-margin" />Đang xử lý check-in...</div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
