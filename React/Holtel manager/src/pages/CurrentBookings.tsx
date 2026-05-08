import { useState, useEffect, useCallback } from "react"
import {
  HomeOutlined, SearchOutlined, FileTextOutlined,
  LoadingOutlined, CalendarOutlined, ClockCircleOutlined,
  CheckCircleOutlined, ShoppingCartOutlined, PlusOutlined,
  CloseOutlined, DollarOutlined, WarningOutlined, ReloadOutlined,
  InboxOutlined,
} from "@ant-design/icons"
import "../assets/css/Profile/BookingHistory.css"
import "../assets/css/Profile/CurrentBookings.css"
import Header from "../shared/Header"
import Footer from "../shared/Fooder"
import { apiGetMyActiveRooms } from "../services/BookingService"
import { apiAddService, apiGetServices, apiGetInvoiceWithDetails } from "../services/InvoiceService"
import { apiGetMyLostItems, apiReportLostItem } from "../services/LostItemService"

interface RoomEntry {
  id: number
  status: string
  deposit?: number
  fromDate?: string
  toDate?: string
  roomTypeName?: string
  roomUseId?: number
  roomId?: number
  roomNumber?: string
  roomStatus?: string
  checkInActual?: string
  pricePerUnit?: number
  invoiceId?: number
  invoiceStatus?: string
  subTotal?: number
  invoiceDetails?: any[]
}

interface Service {
  id: number
  name: string
  price: number
  unit: string
  serviceType: string
}

const fmt = (v?: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v ?? 0)

const fmtDate = (s?: string) => {
  if (!s) return "—"
  return new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function calcNights(from?: string, to?: string) {
  if (!from || !to) return 0
  return Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000))
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ReactElement }> = {
  Active:    { label: "Đang ở",         color: "#166534", bg: "rgba(34,197,94,0.12)",  icon: <CheckCircleOutlined /> },
  Pending:   { label: "Chờ nhận phòng", color: "#b45309", bg: "rgba(245,158,11,0.12)", icon: <ClockCircleOutlined /> },
  Booked:    { label: "Đã đặt",         color: "#1d4ed8", bg: "rgba(59,130,246,0.1)",  icon: <CalendarOutlined /> },
  CheckedIn: { label: "Đang ở",         color: "#166534", bg: "rgba(34,197,94,0.12)",  icon: <CheckCircleOutlined /> },
}

const getBookingStatus = (room: RoomEntry) => {
  if (room.roomStatus === "Active") return STATUS_CFG.Active
  const s = (room.status ?? "").toLowerCase()
  if (s === "checkedin") return STATUS_CFG.CheckedIn
  return STATUS_CFG.Pending
}

export default function CurrentBookings() {
  const [rooms, setRooms]         = useState<RoomEntry[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState("")
  const [filter, setFilter]       = useState<"all" | "active" | "pending">("all")
  const [activeTab, setActiveTab] = useState<"rooms" | "lostitem">("rooms")

  const [lostItems, setLostItems]     = useState<any[]>([])
  const [loadingLost, setLoadingLost] = useState(false)

  const [expandedId, setExpandedId]   = useState<number | null>(null)
  const [invoiceData, setInvoiceData] = useState<Record<number, any>>({})
  const [loadingInv, setLoadingInv]   = useState<number | null>(null)

  const [svcRoomId, setSvcRoomId]   = useState<number | null>(null)
  const [services, setServices]     = useState<Service[]>([])
  const [selSvc, setSelSvc]         = useState<Service | null>(null)
  const [qty, setQty]               = useState(1)
  const [adding, setAdding]         = useState(false)
  const [svcMsg, setSvcMsg]         = useState<Record<number, string>>({})

  const [incidentRoomId, setIncidentRoomId] = useState<number | null>(null)
  const [incidentTitle, setIncidentTitle]   = useState("")
  const [incidentDesc, setIncidentDesc]     = useState("")
  const [submittingInc, setSubmittingInc]   = useState(false)
  const [incMsg, setIncMsg]                 = useState<Record<number, string>>({})

  const loadRooms = useCallback(async () => {
    try {
      const data = await apiGetMyActiveRooms()
      setRooms(Array.isArray(data) ? data : [])
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadRooms() }, [loadRooms])
  useEffect(() => {
    const t = setInterval(loadRooms, 30000)
    return () => clearInterval(t)
  }, [loadRooms])

  const loadLostItems = useCallback(async () => {
    setLoadingLost(true)
    try {
      const data = await apiGetMyLostItems()
      setLostItems(data)
    } catch { setLostItems([]) }
    finally { setLoadingLost(false) }
  }, [])

  useEffect(() => {
    if (activeTab === "lostitem") loadLostItems()
  }, [activeTab, loadLostItems])

  const activeCount  = rooms.filter(r => r.roomStatus === "Active").length
  const pendingCount = rooms.filter(r => r.roomStatus !== "Active").length
  const totalDeposit = rooms.reduce((s, r) => s + (r.deposit ?? 0), 0)

  const filtered = rooms.filter(r => {
    const isActive = r.roomStatus === "Active"
    const matchFilter =
      filter === "all" ||
      (filter === "active" && isActive) ||
      (filter === "pending" && !isActive)
    const q = search.toLowerCase()
    const matchSearch = !q ||
      String(r.id).includes(q) ||
      (r.roomTypeName ?? "").toLowerCase().includes(q) ||
      (r.roomNumber ?? "").toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const toggleInvoice = async (room: RoomEntry) => {
    if (!room.invoiceId) return
    if (expandedId === room.id) { setExpandedId(null); return }
    setExpandedId(room.id)
    if (invoiceData[room.id]) return
    setLoadingInv(room.id)
    try {
      const data = await apiGetInvoiceWithDetails(room.invoiceId)
      setInvoiceData(prev => ({ ...prev, [room.id]: data }))
    } catch {}
    finally { setLoadingInv(null) }
  }

  const openSvcModal = async (room: RoomEntry) => {
    setSvcRoomId(room.id)
    setSelSvc(null)
    setQty(1)
    if (services.length === 0) {
      const data = await apiGetServices()
      setServices(data)
    }
  }

  const handleAddService = async (room: RoomEntry) => {
    if (!selSvc || !room.roomUseId) return
    setAdding(true)
    try {
      await apiAddService({ roomUseId: room.roomUseId, serviceId: selSvc.id, quantity: qty })
      setSvcMsg(prev => ({ ...prev, [room.id]: `✓ Đã gọi "${selSvc.name}" x${qty}` }))
      setSvcRoomId(null)
      if (expandedId === room.id && room.invoiceId) {
        const data = await apiGetInvoiceWithDetails(room.invoiceId)
        setInvoiceData(prev => ({ ...prev, [room.id]: data }))
      }
      setTimeout(() => setSvcMsg(prev => { const n = { ...prev }; delete n[room.id]; return n }), 4000)
    } catch (e: any) {
      setSvcMsg(prev => ({ ...prev, [room.id]: `✗ ${e?.message ?? "Lỗi gọi dịch vụ"}` }))
      setTimeout(() => setSvcMsg(prev => { const n = { ...prev }; delete n[room.id]; return n }), 4000)
    } finally { setAdding(false) }
  }

  const handleSubmitIncident = async (room: RoomEntry) => {
    if (!incidentDesc.trim() || !room.roomUseId) return
    setSubmittingInc(true)
    try {
      await apiReportLostItem({
        roomId:      room.roomId ?? 0,
        roomUseId:   room.roomUseId,
        itemName:    incidentTitle.trim() || "Báo cáo sự cố",
        description: incidentDesc,
        status:      "Pending",
        foundAt:     null,
      })
      setIncMsg(prev => ({ ...prev, [room.id]: "✓ Báo cáo sự cố đã gửi thành công!" }))
      setIncidentRoomId(null)
      setIncidentTitle("")
      setIncidentDesc("")
      setTimeout(() => setIncMsg(prev => { const n = { ...prev }; delete n[room.id]; return n }), 5000)
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.response?.data ?? e?.message ?? "Lỗi gửi báo cáo"
      setIncMsg(prev => ({ ...prev, [room.id]: `✗ ${typeof msg === "string" ? msg : JSON.stringify(msg)}` }))
      setTimeout(() => setIncMsg(prev => { const n = { ...prev }; delete n[room.id]; return n }), 4000)
    } finally { setSubmittingInc(false) }
  }

  const openIncident = (room: RoomEntry) => {
    setIncidentRoomId(room.id)
    setIncidentTitle("")
    setIncidentDesc("")
  }

  const svcRoom      = rooms.find(r => r.id === svcRoomId)
  const incidentRoom = rooms.find(r => r.id === incidentRoomId)

  return (
    <>
      <Header />
      <div className="bh-page">
        <div className="bh-header">
          <div className="container">
            <h1 className="bh-title">
              <HomeOutlined /> Phòng Đang Đặt
              <button className="cb-reload-btn" onClick={loadRooms}>
                <ReloadOutlined /> Làm mới
              </button>
            </h1>
            <p className="bh-sub">
              Danh sách các phòng bạn đã đặt và đang lưu trú · Tự động cập nhật mỗi 30 giây
            </p>
          </div>
        </div>

        <div className="container bh-body">
          
          <div className="cb-tab-bar">
            {([
              { key: "rooms",    label: "Phòng đang đặt", icon: <HomeOutlined /> },
              { key: "lostitem", label: "Đồ thất lạc",    icon: <InboxOutlined /> },
            ] as const).map(t => (
              <button
                key={t.key}
                className={`cb-tab-btn ${activeTab === t.key ? "active" : "inactive"}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          
          {activeTab === "lostitem" && (
            <div>
              <div className="cb-lostitem-header">
                <p className="cb-lostitem-desc">
                  Đồ thất lạc được tìm thấy trong các phòng bạn đã lưu trú
                </p>
                <button className="cb-refresh-btn" onClick={loadLostItems}>
                  <ReloadOutlined /> Làm mới
                </button>
              </div>
              {loadingLost ? (
                <div className="bh-empty"><LoadingOutlined className="cb-loading-icon" /></div>
              ) : lostItems.length === 0 ? (
                <div className="bh-empty">
                  <div className="bh-empty-icon"><InboxOutlined /></div>
                  <p>Không có đồ thất lạc nào được ghi nhận</p>
                </div>
              ) : (
                <div className="bh-txn-list">
                  {lostItems.map(item => (
                    <div key={item.lostItemId} className="bh-txn-card">
                      <div className="bh-txn-icon cb-bg-orange-light cb-text-orange cb-fs-22">
                        📦
                      </div>
                      <div className="bh-txn-info">
                        <div className="bh-txn-title">
                          {item.itemName}
                          {item.roomNumber && <span className="bh-txn-room"> · Phòng {item.roomNumber}</span>}
                        </div>
                        <div className="bh-txn-meta">
                          {item.description && <span>{item.description}</span>}
                          {item.foundAt && (
                            <><span className="cb-text-gray-light">·</span>
                            <span>Tìm thấy: {new Date(item.foundAt).toLocaleDateString("vi-VN")}</span></>
                          )}
                          <span className="cb-text-gray-light">·</span>
                          <span>Báo cáo: {new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                      <div className="bh-txn-right">
                        <span className={`bh-txn-status ${item.status === "Returned" ? "cb-status-returned" : item.status === "Found" ? "cb-status-found" : "cb-status-pending"}`}>
                          {item.status === "Returned" ? "Đã trả" : item.status === "Found" ? "Đã tìm thấy" : item.status === "Pending" ? "Chờ xử lý" : item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          
          {activeTab === "rooms" && (
            <>
              <div className="bh-stats">
                {[
                  { label: "Tổng phòng đặt",  value: rooms.length, color: "#3b82f6", isCount: true },
                  { label: "Đang ở",           value: activeCount,  color: "#22c55e", isCount: true },
                  { label: "Chờ nhận phòng",   value: pendingCount, color: "#f59e0b", isCount: true },
                  { label: "Tổng tiền cọc",    value: totalDeposit, color: "#8b5cf6" },
                ].map(s => (
                  <div key={s.label} className="bh-stat-card">
                    <div className="bh-stat-num" style={{ color: s.color }}>
                      {s.isCount ? s.value : fmt(s.value as number)}
                    </div>
                    <div className="bh-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="bh-filters">
                <div className="bh-filter-tabs">
                  {([
                    { key: "all",     label: "Tất cả" },
                    { key: "active",  label: "Đang ở" },
                    { key: "pending", label: "Chờ nhận" },
                  ] as const).map(t => (
                    <button
                      key={t.key}
                      className={`bh-filter-tab${filter === t.key ? " active" : ""}`}
                      onClick={() => setFilter(t.key)}
                    >{t.label}</button>
                  ))}
                </div>
                <div className="bh-search-wrap">
                  <SearchOutlined className="bh-search-icon" />
                  <input
                    className="bh-search-input"
                    placeholder="Tìm mã đặt, loại phòng, số phòng..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="bh-empty"><LoadingOutlined className="cb-loading-icon-large" /></div>
              ) : filtered.length === 0 ? (
                <div className="bh-empty">
                  <div className="bh-empty-icon"><HomeOutlined /></div>
                  <p>{rooms.length === 0 ? "Bạn chưa có phòng nào đang đặt" : "Không tìm thấy kết quả"}</p>
                </div>
              ) : (
                <div className="bh-txn-list">
                  {filtered.map(room => {
                    const stCfg    = getBookingStatus(room)
                    const isActive = room.roomStatus === "Active"
                    const nights   = calcNights(room.fromDate, room.toDate)
                    const inv      = invoiceData[room.id]
                    const details  = inv?.invoiceDetails ?? []
                    const invTotal = details.reduce((s: number, d: any) => s + (d.totalPrice ?? 0), 0)
                    const isExpanded = expandedId === room.id

                    return (
                      <div key={room.id} className="bh-txn-card cb-room-card">
                        <div className="cb-card-row">
                          <div className="bh-txn-icon cb-flex-shrink-0" style={{ background: stCfg.bg, color: stCfg.color }}>
                            <HomeOutlined />
                          </div>

                          <div className="bh-txn-info">
                            <div className="bh-txn-title">
                              {room.roomTypeName ?? `Booking #${room.id}`}
                              {room.roomNumber && <span className="bh-txn-room"> · Phòng {room.roomNumber}</span>}
                            </div>
                            <div className="bh-txn-meta">
                              <span>
                                <CalendarOutlined className="cb-mr-4" />
                                Nhận: {fmtDate(room.fromDate)} · Trả: {fmtDate(room.toDate)}
                              </span>
                              {nights > 0 && <><span className="cb-text-gray-light">·</span><span>{nights} đêm</span></>}
                              {room.checkInActual && (
                                <><span className="cb-text-gray-light">·</span>
                                <span>
                                  <CheckCircleOutlined className="cb-mr-4 cb-text-green" />
                                  Check-in: {fmtDate(room.checkInActual)}
                                </span></>
                              )}
                            </div>
                            {svcMsg[room.id] && (
                              <div className={svcMsg[room.id].startsWith("✓") ? "cb-msg-ok" : "cb-msg-err"}>
                                {svcMsg[room.id]}
                              </div>
                            )}
                            {incMsg[room.id] && (
                              <div className={incMsg[room.id].startsWith("✓") ? "cb-msg-ok" : "cb-msg-err"}>
                                {incMsg[room.id]}
                              </div>
                            )}
                          </div>

                          <div className="bh-txn-right cb-flex-shrink-0">
                            {room.pricePerUnit && (
                              <div className="bh-txn-amount cb-text-blue">
                                {fmt(room.pricePerUnit)}
                                <span className="cb-text-sm cb-font-normal cb-text-gray">/đêm</span>
                              </div>
                            )}
                            <span className="bh-txn-status" style={{ color: stCfg.color, background: stCfg.bg }}>
                              {stCfg.icon} {stCfg.label}
                            </span>

                            <div className="cb-action-group">
                              {room.invoiceId && (
                                <button
                                  className={`cb-btn-invoice${isExpanded ? " expanded" : ""}`}
                                  onClick={() => toggleInvoice(room)}
                                >
                                  <FileTextOutlined /> Xem giá
                                </button>
                              )}
                              {isActive && (
                                <button className="cb-btn-service" onClick={() => openSvcModal(room)}>
                                  <ShoppingCartOutlined /> Gọi dịch vụ
                                </button>
                              )}
                              {isActive && (
                                <button className="cb-btn-incident" onClick={() => openIncident(room)}>
                                  <WarningOutlined /> Báo cáo sự cố
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="cb-invoice-panel">
                            {loadingInv === room.id ? (
                              <div className="cb-text-center cb-p-12">
                                <LoadingOutlined /> Đang tải...
                              </div>
                            ) : details.length === 0 ? (
                              <div className="cb-empty-text">
                                <DollarOutlined className="cb-mr-6" />Hóa đơn chưa có dịch vụ nào
                              </div>
                            ) : (
                              <div>
                                <div className="cb-invoice-section-label">Chi tiết hóa đơn</div>
                                <table className="cb-invoice-table">
                                  <thead>
                                    <tr>
                                      {["Dịch vụ / Hàng hóa", "Đơn giá", "SL", "Thành tiền"].map(h => (
                                        <th key={h}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {details.map((d: any, i: number) => (
                                      <tr key={d.invoiceDetailId ?? i}>
                                        <td>{d.itemName}</td>
                                        <td>{fmt(d.unitPrice)}</td>
                                        <td>{d.quantity ?? 1}</td>
                                        <td className="cb-font-bold">{fmt(d.totalPrice)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr>
                                      <td colSpan={3} className="cb-text-right">Tạm tính:</td>
                                      <td className="cb-font-bold">{fmt(invTotal)}</td>
                                    </tr>
                                    {(room.deposit ?? 0) > 0 && (
                                      <tr>
                                        <td colSpan={3} className="cb-text-right">Đã cọc:</td>
                                        <td className="cb-text-green cb-font-semibold">- {fmt(room.deposit)}</td>
                                      </tr>
                                    )}
                                    <tr className="cb-border-top-thick">
                                      <td colSpan={3} className="cb-text-right cb-font-bold">Ước tính cần trả:</td>
                                      <td className="cb-text-orange cb-font-extrabold cb-text-lg">
                                        {fmt(Math.max(0, invTotal - (room.deposit ?? 0)))}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      
      {svcRoomId !== null && svcRoom && (
        <div className="cb-modal-overlay" onClick={() => setSvcRoomId(null)}>
          <div className="cb-modal" onClick={e => e.stopPropagation()}>
            <div className="cb-modal-header">
              <span><ShoppingCartOutlined className="cb-mr-8" />Gọi dịch vụ · Phòng {svcRoom.roomNumber ?? svcRoom.id}</span>
              <button className="cb-modal-close" onClick={() => setSvcRoomId(null)}><CloseOutlined /></button>
            </div>
            <div className="cb-modal-body">
              {services.length === 0 ? (
                <div className="cb-loading-center"><LoadingOutlined /> Đang tải...</div>
              ) : (
                <div className="cb-svc-list">
                  {services.map(svc => (
                    <div
                      key={svc.id}
                      className={`cb-svc-item ${selSvc?.id === svc.id ? "selected" : "unselected"}`}
                      onClick={() => setSelSvc(svc)}
                    >
                      <div className="cb-svc-name">{svc.name}</div>
                      <div className="cb-svc-meta">{svc.serviceType} · {fmt(svc.price)}/{svc.unit}</div>
                    </div>
                  ))}
                </div>
              )}
              {selSvc && (
                <div className="cb-qty-row">
                  <span className="cb-fs-14">Số lượng:</span>
                  <div className="cb-flex-center-gap">
                    <button className="cb-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                    <span className="cb-qty-num">{qty}</span>
                    <button className="cb-qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
                  </div>
                  <span className="cb-qty-total">{fmt(selSvc.price * qty)}</span>
                </div>
              )}
            </div>
            <div className="cb-modal-footer">
              <button className="cb-modal-cancel" onClick={() => setSvcRoomId(null)}>Hủy</button>
              <button
                className={`cb-modal-confirm ${selSvc && !adding ? "blue" : "blue-dis"}`}
                onClick={() => handleAddService(svcRoom)}
                disabled={!selSvc || adding}
              >
                <PlusOutlined className="cb-mr-6" />
                {adding ? "Đang gửi..." : "Xác nhận gọi dịch vụ"}
              </button>
            </div>
          </div>
        </div>
      )}

      
      {incidentRoomId !== null && incidentRoom && (
        <div className="cb-modal-overlay" onClick={() => setIncidentRoomId(null)}>
          <div className="cb-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="cb-modal-header">
              <span><WarningOutlined className="cb-mr-8 cb-text-red" />Báo cáo sự cố · Phòng {incidentRoom.roomNumber ?? incidentRoom.id}</span>
              <button className="cb-modal-close" onClick={() => setIncidentRoomId(null)}><CloseOutlined /></button>
            </div>
            <div className="cb-modal-body-pad">
              <label className="cb-form-label">Tên / Tiêu đề sự cố *</label>
              <input
                className="cb-form-input"
                value={incidentTitle}
                onChange={e => setIncidentTitle(e.target.value)}
                placeholder="VD: Điều hòa hỏng, Vòi nước bị rỉ, Đồ thất lạc..."
              />
              <label className="cb-form-label">Mô tả chi tiết *</label>
              <textarea
                className="cb-form-textarea"
                value={incidentDesc}
                onChange={e => setIncidentDesc(e.target.value)}
                placeholder="Mô tả chi tiết sự cố..."
                rows={4}
              />
            </div>
            <div className="cb-modal-footer">
              <button className="cb-modal-cancel" onClick={() => setIncidentRoomId(null)}>Hủy</button>
              <button
                className={`cb-modal-confirm ${incidentDesc.trim() && !submittingInc ? "red" : "red-dis"}`}
                onClick={() => handleSubmitIncident(incidentRoom)}
                disabled={!incidentDesc.trim() || submittingInc}
              >
                {submittingInc
                  ? <><LoadingOutlined className="cb-mr-6" />Đang gửi...</>
                  : <><WarningOutlined className="cb-mr-6" />Gửi báo cáo</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
