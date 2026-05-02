import {
  SearchOutlined, ReloadOutlined, PlusOutlined, CloseOutlined,
  CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined,
  ShoppingCartOutlined, DollarOutlined, HomeOutlined, LoadingOutlined,
} from '@ant-design/icons'
import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../../constant/api'
import { API } from '../../constant/config'
import '../../assets/css/Adminpage/Payment.css'

/* ──────────────── Types ──────────────── */
interface InvoiceDetail {
  invoiceDetailId: number
  itemType: string
  itemName: string
  unitPrice: number
  quantity: number
  totalPrice: number
}

interface Invoice {
  invoiceId: number
  roomUseId: number
  userId: string
  subTotal: number
  discountAmount: number
  surchargeAmount: number
  finalAmount: number
  paymentStatus: string   // "Unpaid" | "Paid"
  paymentMethod: string
  note: string
  createdAt: string
  paidAt?: string
  roomNumber?: string
  roomTypeName?: string
  bookingId?: number
  deposit?: number
  invoiceDetails?: InvoiceDetail[]
}

interface Service {
  id: number
  name: string
  price: number
  unit: string
  serviceType: string
}

const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v ?? 0)

const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

/* ──────────────── Main ──────────────── */
export default function Payment() {
  const [invoices, setInvoices]   = useState<Invoice[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [tab, setTab]             = useState<'all' | 'unpaid' | 'paid'>('all')
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const PAGE_SIZE = 12

  // Detail modal
  const [detail, setDetail]       = useState<Invoice | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Add service modal
  const [showAddSvc, setShowAddSvc] = useState(false)
  const [services, setServices]   = useState<Service[]>([])
  const [selSvc, setSelSvc]       = useState<Service | null>(null)
  const [svcQty, setSvcQty]       = useState(1)
  const [addingSvc, setAddingSvc] = useState(false)

  // Pay modal
  const [paying, setPaying]       = useState(false)
  const [payDiscount, setPayDiscount]   = useState(0)
  const [paySurcharge, setPaySurcharge] = useState(0)
  const [payMethod, setPayMethod]       = useState('Cash')
  const [payNote, setPayNote]           = useState('')
  const [showPayModal, setShowPayModal] = useState(false)

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await apiClient.get(`${API}/invoice?page=${p}&limit=${PAGE_SIZE}`)
      const raw = res.data
      const items: Invoice[] = Array.isArray(raw) ? raw : raw?.data ?? []
      setInvoices(items)
      setTotalCount(raw?.totalCount ?? items.length)
      setTotalPages(raw?.totalPages ?? 1)
    } catch {
      setInvoices([])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load(page) }, [load, page])

  const loadServices = async () => {
    try {
      const res = await apiClient.get(`${API}/services?page=1&limit=100`)
      const raw = res.data
      setServices(Array.isArray(raw) ? raw : raw?.data ?? [])
    } catch { setServices([]) }
  }

  const openDetail = async (inv: Invoice) => {
    setLoadingDetail(true)
    setDetail(inv)
    try {
      const res = await apiClient.get(`${API}/invoice/${inv.invoiceId}/details`)
      setDetail(res.data)
    } catch { /* keep basic data */ }
    finally { setLoadingDetail(false) }
  }

  const handleAddService = async () => {
    if (!selSvc || !detail) return
    setAddingSvc(true)
    try {
      await apiClient.post(`${API}/invoicedetail/add-service`, {
        roomUseId: detail.roomUseId,
        serviceId: selSvc.id,
        quantity: svcQty,
      })
      // Reload detail
      const res = await apiClient.get(`${API}/invoice/${detail.invoiceId}/details`)
      setDetail(res.data)
      setShowAddSvc(false)
      setSelSvc(null); setSvcQty(1)
    } catch (e: any) {
      alert(e?.response?.data ?? 'Thêm dịch vụ thất bại')
    } finally { setAddingSvc(false) }
  }

  const handlePay = async () => {
    if (!detail) return
    setPaying(true)
    try {
      const res = await apiClient.post(`${API}/invoice/${detail.invoiceId}/pay`, {
        discountAmount:  payDiscount,
        surchargeAmount: paySurcharge,
        paymentMethod:   payMethod,
        note:            payNote || '',
      })
      setDetail({ ...detail, ...res.data, paymentStatus: 'Paid' })
      setShowPayModal(false)
      setPayNote('')
      load(page)
    } catch (e: any) {
      alert(e?.response?.data ?? 'Thanh toán thất bại')
    } finally { setPaying(false) }
  }

  const filtered = invoices.filter(inv => {
    const matchTab = tab === 'all' ||
      (tab === 'unpaid' && (inv.paymentStatus ?? '').toLowerCase() !== 'paid') ||
      (tab === 'paid'   && (inv.paymentStatus ?? '').toLowerCase() === 'paid')
    const q = search.toLowerCase()
    const matchSearch = !q ||
      String(inv.invoiceId).includes(q) ||
      (inv.roomNumber ?? '').toLowerCase().includes(q) ||
      (inv.roomTypeName ?? '').toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  const unpaidCount = invoices.filter(i => (i.paymentStatus ?? '').toLowerCase() !== 'paid').length
  const paidTotal   = invoices.filter(i => (i.paymentStatus ?? '').toLowerCase() === 'paid')
                              .reduce((s, i) => s + (i.finalAmount ?? 0), 0)

  /* ── Tính toán preview khi thanh toán ── */
  const detailSubTotal = detail?.invoiceDetails?.reduce((s, d) => s + (d.totalPrice ?? 0), 0) ?? detail?.subTotal ?? 0
  const detailDeposit  = detail?.deposit ?? 0
  const previewFinal   = Math.max(0, detailSubTotal - detailDeposit - payDiscount + paySurcharge)

  return (
    <div className="payment-wrapper">

      {/* Stats */}
      <div className="pmt-stats-row">
        <div className="pmt-stat-card blue">
          <div className="pmt-stat-icon"><FileTextOutlined /></div>
          <div>
            <div className="pmt-stat-val">{totalCount}</div>
            <div className="pmt-stat-lbl">Tổng hóa đơn</div>
          </div>
        </div>
        <div className="pmt-stat-card yellow">
          <div className="pmt-stat-icon"><ClockCircleOutlined /></div>
          <div>
            <div className="pmt-stat-val">{unpaidCount}</div>
            <div className="pmt-stat-lbl">Chưa thanh toán</div>
          </div>
        </div>
        <div className="pmt-stat-card green">
          <div className="pmt-stat-icon"><DollarOutlined /></div>
          <div>
            <div className="pmt-stat-val">{fmt(paidTotal)}</div>
            <div className="pmt-stat-lbl">Đã thu</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="pmt-toolbar">
        <div className="pmt-tabs">
          {(['all','unpaid','paid'] as const).map(t => (
            <button key={t} className={`pmt-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t === 'all' ? 'Tất cả' : t === 'unpaid' ? 'Chưa TT' : 'Đã TT'}
            </button>
          ))}
        </div>
        <div className="pmt-search">
          <SearchOutlined />
          <input placeholder="Tìm mã HĐ, phòng..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="pmt-reload-btn" onClick={() => load(page)}><ReloadOutlined /></button>
      </div>

      {/* Table */}
      <div className="pmt-table-card">
        <table className="pmt-table">
          <thead>
            <tr>
              <th>Mã HĐ</th>
              <th>Phòng</th>
              <th>Loại phòng</th>
              <th>Ngày tạo</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="pmt-empty"><LoadingOutlined /> Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="pmt-empty">Không có dữ liệu</td></tr>
            ) : filtered.map(inv => {
              const isPaid = (inv.paymentStatus ?? '').toLowerCase() === 'paid'
              return (
                <tr key={inv.invoiceId} className="pmt-row" onClick={() => openDetail(inv)}>
                  <td><span className="pmt-id">#{inv.invoiceId}</span></td>
                  <td><span className="pmt-room">{inv.roomNumber ? `Phòng ${inv.roomNumber}` : '—'}</span></td>
                  <td>{inv.roomTypeName ?? '—'}</td>
                  <td className="pmt-date">{fmtDate(inv.createdAt)}</td>
                  <td className="pmt-amount">{fmt(inv.finalAmount ?? 0)}</td>
                  <td>
                    <span className={`pmt-badge ${isPaid ? 'paid' : 'unpaid'}`}>
                      {isPaid ? <><CheckCircleOutlined /> Đã TT</> : <><ClockCircleOutlined /> Chưa TT</>}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="pmt-detail-btn" onClick={() => openDetail(inv)}>Chi tiết</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pmt-pagination">
          <span className="pmt-page-info">Trang {page}/{totalPages} — {totalCount} hóa đơn</span>
          <div className="pmt-page-btns">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, page - 2) + i
              if (p > totalPages) return null
              return <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
            })}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {detail && (
        <div className="pmt-modal-overlay" onClick={() => setDetail(null)}>
          <div className="pmt-modal" onClick={e => e.stopPropagation()}>
            <div className="pmt-modal-header">
              <div>
                <div className="pmt-modal-title">Hóa đơn #{detail.invoiceId}</div>
                <div className="pmt-modal-sub">
                  {detail.roomNumber && <span><HomeOutlined /> Phòng {detail.roomNumber}</span>}
                  {detail.roomTypeName && <span> · {detail.roomTypeName}</span>}
                </div>
              </div>
              <div className="pmt-modal-actions">
                {(detail.paymentStatus ?? '').toLowerCase() !== 'paid' && (
                  <>
                    <button className="pmt-btn-svc" onClick={() => { setShowAddSvc(true); loadServices() }}>
                      <PlusOutlined /> Thêm dịch vụ
                    </button>
                    <button className="pmt-btn-pay" onClick={() => setShowPayModal(true)}>
                      <DollarOutlined /> Thanh toán
                    </button>
                  </>
                )}
                <button className="pmt-btn-close" onClick={() => setDetail(null)}><CloseOutlined /></button>
              </div>
            </div>

            {loadingDetail ? (
              <div className="pmt-detail-loading"><LoadingOutlined /> Đang tải chi tiết...</div>
            ) : (
              <div className="pmt-modal-body">
                {/* Invoice Details list */}
                <div className="pmt-detail-section">
                  <div className="pmt-detail-section-title">Chi tiết hóa đơn</div>
                  {detail.invoiceDetails && detail.invoiceDetails.length > 0 ? (
                    <table className="pmt-detail-table">
                      <thead>
                        <tr><th>Hạng mục</th><th>Loại</th><th>Đơn giá</th><th>SL</th><th>Thành tiền</th></tr>
                      </thead>
                      <tbody>
                        {detail.invoiceDetails.map(d => (
                          <tr key={d.invoiceDetailId}>
                            <td>{d.itemName}</td>
                            <td><span className={`pmt-item-type ${d.itemType?.toLowerCase()}`}>{d.itemType === 'Room' ? '🏠 Phòng' : '🛎 Dịch vụ'}</span></td>
                            <td>{fmt(d.unitPrice ?? 0)}</td>
                            <td>{d.quantity}</td>
                            <td className="pmt-amount">{fmt(d.totalPrice ?? 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="pmt-empty-detail">Chưa có chi tiết</div>
                  )}
                </div>

                {/* Summary */}
                <div className="pmt-summary-box">
                  {[
                    ['Tạm tính', fmt(detailSubTotal)],
                    ['Tiền cọc (đã trả)', detailDeposit > 0 ? `-${fmt(detailDeposit)}` : '—'],
                    ['Giảm giá', detail.discountAmount ? `-${fmt(detail.discountAmount)}` : '—'],
                    ['Phụ thu',  detail.surchargeAmount ? fmt(detail.surchargeAmount) : '—'],
                  ].map(([l, v]) => (
                    <div key={l} className="pmt-summary-row">
                      <span>{l}</span><span>{v}</span>
                    </div>
                  ))}
                  <div className="pmt-summary-total">
                    <span>Tổng cần thanh toán</span>
                    <span>{fmt(detail.finalAmount ?? 0)}</span>
                  </div>
                  <div className="pmt-summary-status">
                    Trạng thái: <span className={(detail.paymentStatus ?? '').toLowerCase() === 'paid' ? 'paid' : 'unpaid'}>
                      {(detail.paymentStatus ?? '').toLowerCase() === 'paid'
                        ? `✅ Đã thanh toán${detail.paidAt ? ` — ${fmtDate(detail.paidAt)}` : ''}`
                        : '⏳ Chưa thanh toán'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Add Service Modal ── */}
      {showAddSvc && detail && (
        <div className="pmt-modal-overlay" onClick={() => setShowAddSvc(false)}>
          <div className="pmt-modal pmt-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="pmt-modal-header">
              <div className="pmt-modal-title"><ShoppingCartOutlined /> Thêm dịch vụ</div>
              <button className="pmt-btn-close" onClick={() => setShowAddSvc(false)}><CloseOutlined /></button>
            </div>
            <div className="pmt-modal-body">
              <div className="pmt-svc-list">
                {services.length === 0 ? (
                  <div className="pmt-empty-detail">Không có dịch vụ</div>
                ) : services.map(svc => (
                  <div key={svc.id}
                    className={`pmt-svc-item${selSvc?.id === svc.id ? ' selected' : ''}`}
                    onClick={() => setSelSvc(svc)}>
                    <div className="pmt-svc-name">{svc.name}</div>
                    <div className="pmt-svc-meta">{svc.serviceType} · {fmt(svc.price)}/{svc.unit}</div>
                  </div>
                ))}
              </div>
              {selSvc && (
                <div className="pmt-svc-qty-row">
                  <label>Số lượng:</label>
                  <input type="number" min={1} value={svcQty}
                    onChange={e => setSvcQty(Math.max(1, Number(e.target.value)))} />
                  <span className="pmt-svc-total">{fmt(selSvc.price * svcQty)}</span>
                </div>
              )}
              <button className="pmt-btn-pay" style={{ width: '100%', marginTop: 12 }}
                disabled={!selSvc || addingSvc} onClick={handleAddService}>
                {addingSvc ? <><LoadingOutlined /> Đang thêm...</> : <><PlusOutlined /> Thêm vào hóa đơn</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pay Modal ── */}
      {showPayModal && detail && (
        <div className="pmt-modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="pmt-modal pmt-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="pmt-modal-header">
              <div className="pmt-modal-title"><DollarOutlined /> Xác nhận thanh toán</div>
              <button className="pmt-btn-close" onClick={() => setShowPayModal(false)}><CloseOutlined /></button>
            </div>
            <div className="pmt-modal-body">
              <div className="pmt-pay-form">
                <label>Phương thức</label>
                <select value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                  <option value="Cash">Tiền mặt</option>
                  <option value="Card">Thẻ ngân hàng</option>
                  <option value="Transfer">Chuyển khoản</option>
                </select>
                <label>Giảm giá thêm (₫)</label>
                <input type="number" min={0} value={payDiscount}
                  onChange={e => setPayDiscount(Number(e.target.value))} />
                <label>Phụ thu thêm (₫)</label>
                <input type="number" min={0} value={paySurcharge}
                  onChange={e => setPaySurcharge(Number(e.target.value))} />
                <label>Ghi chú</label>
                <input type="text" value={payNote} placeholder="Ghi chú thanh toán (tuỳ chọn)"
                  onChange={e => setPayNote(e.target.value)} />
              </div>
              <div className="pmt-pay-preview">
                <div><span>Tạm tính</span><span>{fmt(detailSubTotal)}</span></div>
                {detailDeposit > 0 && <div><span>Trừ cọc</span><span>-{fmt(detailDeposit)}</span></div>}
                {payDiscount > 0  && <div><span>Giảm giá</span><span>-{fmt(payDiscount)}</span></div>}
                {paySurcharge > 0 && <div><span>Phụ thu</span><span>+{fmt(paySurcharge)}</span></div>}
                <div className="pmt-pay-final"><span>Tổng thanh toán</span><span>{fmt(previewFinal)}</span></div>
              </div>
              <button className="pmt-btn-pay" style={{ width: '100%' }}
                disabled={paying} onClick={handlePay}>
                {paying ? <><LoadingOutlined /> Đang xử lý...</> : <><CheckCircleOutlined /> Xác nhận thanh toán</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
