import { useState, useEffect } from "react"
import {
  HistoryOutlined, SearchOutlined, FileTextOutlined,
  LoadingOutlined, DollarOutlined, HomeOutlined,
  CheckCircleOutlined, ClockCircleOutlined,
  BankOutlined, ShoppingCartOutlined,
} from "@ant-design/icons"
import "../assets/css/Profile/BookingHistory.css"
import Header from "../shared/Header"
import Footer from "../shared/Fooder"
import { apiGetMyTransactionHistory } from "../services/BookingService"

interface Transaction {
  transactionId: string
  type: "Deposit" | "Invoice" | string
  typeLabel: string
  bookingId: number
  invoiceId?: number
  roomTypeName?: string
  roomNumber?: string
  amount?: number
  status?: string
  date?: string
  paidAt?: string
  note?: string
}

const fmt = (v?: number) =>
  v != null
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v)
    : "—"

const fmtDate = (s?: string) => {
  if (!s) return "—"
  return new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}
const fmtDatetime = (s?: string) => {
  if (!s) return "—"
  return new Date(s).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

const TYPE_CFG: Record<string, { icon: JSX.Element; color: string; bg: string }> = {
  Deposit: { icon: <BankOutlined />,        color: "#3b82f6", bg: "#eff6ff" },
  Invoice: { icon: <ShoppingCartOutlined />, color: "#8b5cf6", bg: "#f5f3ff" },
}
const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  Paid:    { label: "Đã thanh toán",  color: "#166534", bg: "rgba(34,197,94,0.12)" },
  Unpaid:  { label: "Chưa thanh toán", color: "#b45309", bg: "rgba(245,158,11,0.12)" },
  Pending: { label: "Chờ xử lý",      color: "#1d4ed8", bg: "rgba(59,130,246,0.1)" },
}

export default function BookingHistory() {
  const [txns, setTxns]         = useState<Transaction[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState("")
  const [typeFilter, setType]   = useState<"all" | "Deposit" | "Invoice">("all")

  useEffect(() => {
    setLoading(true)
    apiGetMyTransactionHistory()
      .then(data => setTxns(Array.isArray(data) ? data as Transaction[] : []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = txns.filter(t => {
    const matchType = typeFilter === "all" || t.type === typeFilter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      String(t.bookingId).includes(q) ||
      (t.roomTypeName ?? "").toLowerCase().includes(q) ||
      (t.roomNumber ?? "").toLowerCase().includes(q) ||
      (t.typeLabel ?? "").toLowerCase().includes(q)
    return matchType && matchSearch
  })

  const totalPaid   = txns.filter(t => t.status === "Paid").reduce((s, t) => s + (t.amount ?? 0), 0)
  const totalUnpaid = txns.filter(t => t.status === "Unpaid").reduce((s, t) => s + (t.amount ?? 0), 0)
  const depositTotal = txns.filter(t => t.type === "Deposit").reduce((s, t) => s + (t.amount ?? 0), 0)

  return (
    <>
      <Header />
      <div className="bh-page">
        <div className="bh-header">
          <div className="container">
            <h1 className="bh-title"><HistoryOutlined /> Lịch Sử Giao Dịch</h1>
            <p className="bh-sub">Toàn bộ giao dịch đặt cọc và hóa đơn của bạn</p>
          </div>
        </div>

        <div className="container bh-body">
          {/* Stats */}
          <div className="bh-stats">
            {[
              { label: "Tổng giao dịch",  value: txns.length,         color: "#3b82f6", isCount: true },
              { label: "Tổng đặt cọc",    value: depositTotal,        color: "#8b5cf6" },
              { label: "Đã thanh toán",   value: totalPaid,           color: "#22c55e" },
              { label: "Chưa thanh toán", value: totalUnpaid,         color: "#f59e0b" },
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
                { key: "Deposit", label: "Đặt cọc" },
                { key: "Invoice", label: "Hóa đơn" },
              ] as const).map(t => (
                <button
                  key={t.key}
                  className={`bh-filter-tab${typeFilter === t.key ? " active" : ""}`}
                  onClick={() => setType(t.key)}
                >{t.label}</button>
              ))}
            </div>
            <div className="bh-search-wrap">
              <SearchOutlined className="bh-search-icon" />
              <input
                className="bh-search-input"
                placeholder="Tìm loại phòng, số phòng, mã đặt..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="bh-empty"><LoadingOutlined style={{ fontSize: 32 }} /></div>
          ) : filtered.length === 0 ? (
            <div className="bh-empty">
              <div className="bh-empty-icon"><FileTextOutlined /></div>
              <p>{txns.length === 0 ? "Chưa có giao dịch nào" : "Không tìm thấy kết quả"}</p>
            </div>
          ) : (
            <div className="bh-txn-list">
              {filtered.map(t => {
                const typeCfg   = TYPE_CFG[t.type] ?? TYPE_CFG.Invoice
                const statusCfg = STATUS_CFG[t.status ?? ""] ?? { label: t.status, color: "#64748b", bg: "rgba(0,0,0,0.06)" }
                return (
                  <div key={t.transactionId} className="bh-txn-card">
                    {/* Icon */}
                    <div className="bh-txn-icon" style={{ background: typeCfg.bg, color: typeCfg.color }}>
                      {typeCfg.icon}
                    </div>

                    {/* Info */}
                    <div className="bh-txn-info">
                      <div className="bh-txn-title">
                        {t.typeLabel}
                        {t.roomNumber && <span className="bh-txn-room"> · Phòng {t.roomNumber}</span>}
                        {t.invoiceId && <span className="bh-txn-id"> · HĐ #{t.invoiceId}</span>}
                      </div>
                      <div className="bh-txn-meta">
                        <span><HomeOutlined style={{ marginRight: 4 }} />{t.roomTypeName ?? `Booking #${t.bookingId}`}</span>
                        <span style={{ color: "#cbd5e1" }}>·</span>
                        <span><ClockCircleOutlined style={{ marginRight: 4 }} />{fmtDate(t.date)}</span>
                        {t.paidAt && (
                          <>
                            <span style={{ color: "#cbd5e1" }}>·</span>
                            <span><CheckCircleOutlined style={{ marginRight: 4, color: "#22c55e" }} />Thanh toán: {fmtDatetime(t.paidAt)}</span>
                          </>
                        )}
                      </div>
                      {t.note && <div className="bh-txn-note">{t.note}</div>}
                    </div>

                    {/* Amount + Status */}
                    <div className="bh-txn-right">
                      <div className="bh-txn-amount" style={{ color: typeCfg.color }}>
                        <DollarOutlined style={{ marginRight: 4 }} />
                        {fmt(t.amount)}
                      </div>
                      <span className="bh-txn-status" style={{ color: statusCfg.color, background: statusCfg.bg }}>
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
