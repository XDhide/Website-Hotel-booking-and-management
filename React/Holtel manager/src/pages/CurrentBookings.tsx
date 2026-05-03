import { useState, useEffect, useCallback } from "react"
import {
  HomeOutlined, SearchOutlined, FileTextOutlined,
  LoadingOutlined, CalendarOutlined, ClockCircleOutlined,
  CheckCircleOutlined, ShoppingCartOutlined, PlusOutlined,
  CloseOutlined, DollarOutlined, WarningOutlined, ReloadOutlined,
} from "@ant-design/icons"
import "../assets/css/Profile/BookingHistory.css"
import "../assets/css/Profile/CurrentBookings.css"
import Header from "../shared/Header"
import Footer from "../shared/Fooder"
import { apiGetMyActiveRooms } from "../services/BookingService"
import { apiAddService, apiGetServices, apiGetInvoiceWithDetails } from "../services/InvoiceService"
import { apiClient } from "../constant/api"
import { API } from "../constant/config"

interface RoomEntry {
  id: number
  status: string
  deposit?: number
  fromDate?: string
  toDate?: string
  roomTypeName?: string
  roomUseId?: number
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

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: JSX.Element }> = {
  Active:   { label: "Đang ở",           color: "#166534", bg: "rgba(34,197,94,0.12)",   icon: <CheckCircleOutlined /> },
  Pending:  { label: "Chờ nhận phòng",   color: "#b45309", bg: "rgba(245,158,11,0.12)",  icon: <ClockCircleOutlined /> },
  Booked:   { label: "Đã đặt",           color: "#1d4ed8", bg: "rgba(59,130,246,0.1)",   icon: <CalendarOutlined /> },
  CheckedIn:{ label: "Đang ở",           color: "#166534", bg: "rgba(34,197,94,0.12)",   icon: <CheckCircleOutlined /> },
}

const getBookingStatus = (room: RoomEntry) => {
  if (room.roomStatus === "Active") return STATUS_CFG.Active
  const s = (room.status ?? "").toLowerCase()
  if (s === "checkedin") return STATUS_CFG.CheckedIn
  return STATUS_CFG.Pending
}

export default function CurrentBookings() {
  const [rooms, setRooms]       = useState<RoomEntry[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState("")
  const [filter, setFilter]     = useState<"all" | "active" | "pending">("all")

  // Invoice expand
  const [expandedId, setExpandedId]   = useState<number | null>(null)
  const [invoiceData, setInvoiceData] = useState<Record<number, any>>({})
  const [loadingInv, setLoadingInv]   = useState<number | null>(null)

  // Service modal
  const [svcRoomId, setSvcRoomId]   = useState<number | null>(null)
  const [services, setServices]     = useState<Service[]>([])
  const [selSvc, setSelSvc]         = useState<Service | null>(null)
  const [qty, setQty]               = useState(1)
  const [adding, setAdding]         = useState(false)
  const [svcMsg, setSvcMsg]         = useState<Record<number, string>>({})

  // Incident report modal
  const [incidentRoomId, setIncidentRoomId] = useState<number | null>(null)
  const [incidentDesc, setIncidentDesc]     = useState("")
  const [incidentImg, setIncidentImg]       = useState("")
  const [submittingInc, setSubmittingInc]   = useState(false)
  const [incMsg, setIncMsg]                 = useState<Record<number, string>>({})

  const loadRooms = useCallback(async () => {
    try {
      const data = await apiGetMyActiveRooms()
      setRooms(Array.isArray(data) ? data : [])
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadRooms() }, [loadRooms])

  // Auto-refresh mỗi 30s để detect khi admin thanh toán HĐ
  useEffect(() => {
    const t = setInterval(loadRooms, 30000)
    return () => clearInterval(t)
  }, [loadRooms])

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
    } catch { /* ignore */ }
    finally { setLoadingInv(null) }
  }

  const openSvcModal = async (room: RoomEntry) => {
    setSvcRoomId(room.id)
    setSelSvc(null); setQty(1)
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
      setTimeout(() => setSvcMsg(prev => { const n = {...prev}; delete n[room.id]; return n }), 4000)
    } catch (e: any) {
      setSvcMsg(prev => ({ ...prev, [room.id]: `✗ ${e?.message ?? "Lỗi gọi dịch vụ"}` }))
      setTimeout(() => setSvcMsg(prev => { const n = {...prev}; delete n[room.id]; return n }), 4000)
    } finally { setAdding(false) }
  }

  const handleSubmitIncident = async (room: RoomEntry) => {
    if (!incidentDesc.trim() || !room.roomUseId) return
    setSubmittingInc(true)
    try {
      await apiClient.post(`${API}/report`, {
        roomUseId: room.roomUseId,
        description: incidentDesc,
        imageUrl: incidentImg || null,
        status: "Pending",
        createdAt: new Date().toISOString(),
      })
      setIncMsg(prev => ({ ...prev, [room.id]: "✓ Báo cáo sự cố đã gửi thành công!" }))
      setIncidentRoomId(null)
      setIncidentDesc("")
      setIncidentImg("")
      setTimeout(() => setIncMsg(prev => { const n = {...prev}; delete n[room.id]; return n }), 5000)
    } catch (e: any) {
      setIncMsg(prev => ({ ...prev, [room.id]: `✗ ${e?.response?.data ?? e?.message ?? "Lỗi gửi báo cáo"}` }))
      setTimeout(() => setIncMsg(prev => { const n = {...prev}; delete n[room.id]; return n }), 4000)
    } finally { setSubmittingInc(false) }
  }

  const svcRoom = rooms.find(r => r.id === svcRoomId)
  const incidentRoom = rooms.find(r => r.id === incidentRoomId)

  return (
    <>
      <Header />
      <div className="bh-page">
        <div className="bh-header">
          <div className="container">
            <h1 className="bh-title"><HomeOutlined /> Phòng Đang Đặt
            <button onClick={loadRooms} style={{ marginLeft: 12, background: "rgba(59,130,246,0.1)", border: "1px solid #bfdbfe", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 13, color: "#3b82f6", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <ReloadOutlined /> Làm mới
            </button>
          </h1>
            <p className="bh-sub">Danh sách các phòng bạn đã đặt và đang lưu trú · Tự động cập nhật mỗi 30 giây</p>
          </div>
        </div>

        <div className="container bh-body">
          {/* Stats */}
          <div className="bh-stats">
            {[
              { label: "Tổng phòng đặt",    value: rooms.length,  color: "#3b82f6", isCount: true },
              { label: "Đang ở",            value: activeCount,   color: "#22c55e", isCount: true },
              { label: "Chờ nhận phòng",    value: pendingCount,  color: "#f59e0b", isCount: true },
              { label: "Tổng tiền cọc",     value: totalDeposit,  color: "#8b5cf6" },
            ].map(s => (
              <div key={s.label} className="bh-stat-card">
                <div className="bh-stat-num" style={{ color: s.color }}>
                  {s.isCount ? s.value : fmt(s.value as number)}
                </div>
                <div className="bh-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
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

          {/* List */}
          {loading ? (
            <div className="bh-empty"><LoadingOutlined style={{ fontSize: 32 }} /></div>
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
                  <div key={room.id} className="bh-txn-card cb-room-card" style={{ flexDirection: "column", alignItems: "stretch", gap: 0 }}>
                    {/* Main row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      {/* Icon */}
                      <div className="bh-txn-icon" style={{ background: stCfg.bg, color: stCfg.color, flexShrink: 0 }}>
                        <HomeOutlined />
                      </div>

                      {/* Info */}
                      <div className="bh-txn-info">
                        <div className="bh-txn-title">
                          {room.roomTypeName ?? `Booking #${room.id}`}
                          {room.roomNumber && <span className="bh-txn-room"> · Phòng {room.roomNumber}</span>}
                        </div>
                        <div className="bh-txn-meta">
                          <span><CalendarOutlined style={{ marginRight: 4 }} />
                            Nhận: {fmtDate(room.fromDate)} · Trả: {fmtDate(room.toDate)}
                          </span>
                          {nights > 0 && <><span style={{ color: "#cbd5e1" }}>·</span><span>{nights} đêm</span></>}
                          {room.checkInActual && (
                            <><span style={{ color: "#cbd5e1" }}>·</span>
                            <span><CheckCircleOutlined style={{ marginRight: 4, color: "#22c55e" }} />
                              Check-in: {fmtDate(room.checkInActual)}
                            </span></>
                          )}
                        </div>
                        {svcMsg[room.id] && (
                          <div style={{
                            marginTop: 6, fontSize: 12, fontWeight: 600,
                            color: svcMsg[room.id].startsWith("✓") ? "#166534" : "#b91c1c"
                          }}>{svcMsg[room.id]}</div>
                        )}
                        {incMsg[room.id] && (
                          <div style={{
                            marginTop: 6, fontSize: 12, fontWeight: 600,
                            color: incMsg[room.id].startsWith("✓") ? "#166534" : "#b91c1c"
                          }}>{incMsg[room.id]}</div>
                        )}
                      </div>

                      {/* Right: price + status + actions */}
                      <div className="bh-txn-right" style={{ flexShrink: 0 }}>
                        {room.pricePerUnit && (
                          <div className="bh-txn-amount" style={{ color: "#3b82f6" }}>
                            {fmt(room.pricePerUnit)}<span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8" }}>/đêm</span>
                          </div>
                        )}
                        <span className="bh-txn-status" style={{ color: stCfg.color, background: stCfg.bg }}>
                          {stCfg.icon} {stCfg.label}
                        </span>

                        {/* Action buttons */}
                        <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                          {room.invoiceId && (
                            <button
                              onClick={() => toggleInvoice(room)}
                              style={{
                                padding: "5px 10px", fontSize: 12, fontWeight: 600,
                                border: "1px solid #bfdbfe", borderRadius: 7,
                                background: isExpanded ? "#eff6ff" : "#fff",
                                color: "#3b82f6", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 4,
                              }}
                            >
                              <FileTextOutlined /> Xem giá
                            </button>
                          )}
                          {isActive && (
                            <button
                              onClick={() => openSvcModal(room)}
                              style={{
                                padding: "5px 10px", fontSize: 12, fontWeight: 600,
                                border: "1px solid #bbf7d0", borderRadius: 7,
                                background: "#f0fdf4", color: "#166534",
                                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                              }}
                            >
                              <ShoppingCartOutlined /> Gọi dịch vụ
                            </button>
                          )}
                          {isActive && (
                            <button
                              onClick={() => { setIncidentRoomId(room.id); setIncidentDesc(""); setIncidentImg(""); }}
                              style={{
                                padding: "5px 10px", fontSize: 12, fontWeight: 600,
                                border: "1px solid #fecaca", borderRadius: 7,
                                background: "#fef2f2", color: "#b91c1c",
                                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                              }}
                            >
                              <WarningOutlined /> Báo cáo sự cố
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded invoice */}
                    {isExpanded && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #e8f0fe" }}>
                        {loadingInv === room.id ? (
                          <div style={{ textAlign: "center", padding: 12 }}><LoadingOutlined /> Đang tải...</div>
                        ) : details.length === 0 ? (
                          <div style={{ color: "#94a3b8", fontSize: 13, padding: "4px 0" }}>
                            <DollarOutlined style={{ marginRight: 6 }} />Hóa đơn chưa có dịch vụ nào
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                              Chi tiết hóa đơn
                            </div>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                              <thead>
                                <tr>
                                  {["Dịch vụ / Hàng hóa", "Đơn giá", "SL", "Thành tiền"].map(h => (
                                    <th key={h} style={{ textAlign: "left", color: "#64748b", fontWeight: 600, padding: "6px 8px", borderBottom: "1px solid #e8f0fe" }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {details.map((d: any, i: number) => (
                                  <tr key={d.invoiceDetailId ?? i}>
                                    <td style={{ padding: "8px 8px", borderBottom: "1px solid #f1f5f9", color: "#1e3a5f" }}>{d.itemName}</td>
                                    <td style={{ padding: "8px 8px", borderBottom: "1px solid #f1f5f9" }}>{fmt(d.unitPrice)}</td>
                                    <td style={{ padding: "8px 8px", borderBottom: "1px solid #f1f5f9" }}>{d.quantity ?? 1}</td>
                                    <td style={{ padding: "8px 8px", borderBottom: "1px solid #f1f5f9", fontWeight: 700 }}>{fmt(d.totalPrice)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colSpan={3} style={{ textAlign: "right", color: "#64748b", padding: "8px 8px" }}>Tạm tính:</td>
                                  <td style={{ fontWeight: 700, padding: "8px 8px" }}>{fmt(invTotal)}</td>
                                </tr>
                                {(room.deposit ?? 0) > 0 && (
                                  <tr>
                                    <td colSpan={3} style={{ textAlign: "right", color: "#64748b", padding: "4px 8px" }}>Đã cọc:</td>
                                    <td style={{ color: "#22c55e", fontWeight: 600, padding: "4px 8px" }}>- {fmt(room.deposit)}</td>
                                  </tr>
                                )}
                                <tr style={{ borderTop: "2px solid #e8f0fe" }}>
                                  <td colSpan={3} style={{ textAlign: "right", fontWeight: 700, padding: "8px 8px" }}>Ước tính cần trả:</td>
                                  <td style={{ color: "#f59e0b", fontWeight: 800, fontSize: 15, padding: "8px 8px" }}>
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
        </div>
      </div>

      {/* Modal gọi dịch vụ */}
      {svcRoomId !== null && svcRoom && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setSvcRoomId(null)}>
          <div style={{ background: "#fff", borderRadius: 16, width: 460, maxWidth: "95vw", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e8f0fe", fontWeight: 700, fontSize: 15, color: "#1e3a5f" }}>
              <span><ShoppingCartOutlined style={{ marginRight: 8 }} />Gọi dịch vụ · Phòng {svcRoom.roomNumber ?? svcRoom.id}</span>
              <button onClick={() => setSvcRoomId(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8" }}><CloseOutlined /></button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              {services.length === 0 ? (
                <div style={{ textAlign: "center", color: "#94a3b8", padding: 20 }}><LoadingOutlined /> Đang tải...</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {services.map(svc => (
                    <div key={svc.id}
                      onClick={() => setSelSvc(svc)}
                      style={{
                        border: `1px solid ${selSvc?.id === svc.id ? "#3b82f6" : "#dbeafe"}`,
                        background: selSvc?.id === svc.id ? "#eff6ff" : "#fff",
                        borderRadius: 10, padding: "12px 14px", cursor: "pointer",
                      }}>
                      <div style={{ fontWeight: 600, color: "#1e3a5f" }}>{svc.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{svc.serviceType} · {fmt(svc.price)}/{svc.unit}</div>
                    </div>
                  ))}
                </div>
              )}

              {selSvc && (
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16, padding: "12px 14px", background: "#f8faff", borderRadius: 10, border: "1px solid #dbeafe" }}>
                  <span style={{ fontSize: 14 }}>Số lượng:</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #bfdbfe", background: "#fff", cursor: "pointer", fontWeight: 700, color: "#3b82f6" }}>−</button>
                    <span style={{ fontWeight: 700, minWidth: 24, textAlign: "center" }}>{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #bfdbfe", background: "#fff", cursor: "pointer", fontWeight: 700, color: "#3b82f6" }}>+</button>
                  </div>
                  <span style={{ color: "#f59e0b", fontWeight: 700, marginLeft: "auto" }}>{fmt(selSvc.price * qty)}</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, padding: "14px 20px", borderTop: "1px solid #e8f0fe" }}>
              <button onClick={() => setSvcRoomId(null)} style={{ flex: 1, padding: 10, border: "1px solid #bfdbfe", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14 }}>Hủy</button>
              <button
                onClick={() => handleAddService(svcRoom)}
                disabled={!selSvc || adding}
                style={{ flex: 2, padding: 10, background: selSvc && !adding ? "#3b82f6" : "#93c5fd", border: "none", borderRadius: 8, color: "#fff", cursor: selSvc && !adding ? "pointer" : "not-allowed", fontSize: 14, fontWeight: 700 }}>
                <PlusOutlined style={{ marginRight: 6 }} />{adding ? "Đang gửi..." : "Xác nhận gọi dịch vụ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal báo cáo sự cố */}
      {incidentRoomId !== null && incidentRoom && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setIncidentRoomId(null)}>
          <div style={{ background: "#fff", borderRadius: 16, width: 460, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e8f0fe", fontWeight: 700, fontSize: 15, color: "#1e3a5f" }}>
              <span><WarningOutlined style={{ marginRight: 8, color: "#ef4444" }} />Báo cáo sự cố · Phòng {incidentRoom.roomNumber ?? incidentRoom.id}</span>
              <button onClick={() => setIncidentRoomId(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8" }}><CloseOutlined /></button>
            </div>
            <div style={{ padding: "20px" }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#475569", marginBottom: 6 }}>Mô tả sự cố *</label>
              <textarea
                value={incidentDesc}
                onChange={e => setIncidentDesc(e.target.value)}
                placeholder="Mô tả chi tiết sự cố (ví dụ: điều hòa không hoạt động, vòi nước bị rỉ...)"
                rows={4}
                style={{ width: "100%", border: "1.5px solid #dbeafe", borderRadius: 10, padding: "10px 14px", fontSize: 14, boxSizing: "border-box", resize: "vertical", outline: "none" }}
              />
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#475569", marginBottom: 6, marginTop: 14 }}>Link ảnh (tuỳ chọn)</label>
              <input
                value={incidentImg}
                onChange={e => setIncidentImg(e.target.value)}
                placeholder="https://..."
                style={{ width: "100%", border: "1.5px solid #dbeafe", borderRadius: 10, padding: "10px 14px", fontSize: 14, boxSizing: "border-box", outline: "none" }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, padding: "14px 20px", borderTop: "1px solid #e8f0fe" }}>
              <button onClick={() => setIncidentRoomId(null)} style={{ flex: 1, padding: 10, border: "1px solid #bfdbfe", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14 }}>Hủy</button>
              <button
                onClick={() => handleSubmitIncident(incidentRoom)}
                disabled={!incidentDesc.trim() || submittingInc}
                style={{ flex: 2, padding: 10, background: incidentDesc.trim() && !submittingInc ? "#ef4444" : "#fca5a5", border: "none", borderRadius: 8, color: "#fff", cursor: incidentDesc.trim() && !submittingInc ? "pointer" : "not-allowed", fontSize: 14, fontWeight: 700 }}>
                {submittingInc ? <><LoadingOutlined style={{ marginRight: 6 }} />Đang gửi...</> : <><WarningOutlined style={{ marginRight: 6 }} />Gửi báo cáo</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
