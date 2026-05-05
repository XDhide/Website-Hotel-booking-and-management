import { useState, useEffect } from "react"
import {
  SearchOutlined, LoadingOutlined, WarningOutlined,
  HomeOutlined, ClockCircleOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons"
import "../assets/css/Profile/BookingHistory.css"
import Header from "../shared/Header"
import Footer from "../shared/Fooder"
import { apiClient } from "../constant/api"
import { API } from "../constant/config"

interface LostItem {
  lostItemId: number
  itemName: string
  description?: string
  foundAt?: string
  status: string
  createdAt?: string
  roomNumber?: string
  roomId?: number
  roomUseId?: number
}

const fmtDate = (s?: string) => {
  if (!s) return "—"
  return new Date(s).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: JSX.Element }> = {
  Pending:  { label: "Chờ xử lý",  color: "#b45309", bg: "rgba(245,158,11,0.12)",  icon: <ClockCircleOutlined /> },
  Found:    { label: "Đã tìm thấy",color: "#166534", bg: "rgba(34,197,94,0.12)",   icon: <CheckCircleOutlined /> },
  Returned: { label: "Đã trả lại", color: "#1d4ed8", bg: "rgba(59,130,246,0.1)",   icon: <CheckCircleOutlined /> },
  Lost:     { label: "Thất lạc",   color: "#991b1b", bg: "rgba(239,68,68,0.1)",    icon: <ExclamationCircleOutlined /> },
}

export default function LostItemsPage() {
  const [items, setItems]   = useState<LostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")
  const [filter, setFilter]   = useState<"all" | "incident" | "found">("all")

  useEffect(() => {
    setLoading(true)
    apiClient.get(`${API}/lostitem/my-lostitem`)
      .then(res => {
        const raw = res.data
        setItems(Array.isArray(raw) ? raw : raw?.data ?? [])
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(item => {
    const matchFilter =
      filter === "all" ||
      (filter === "incident" && item.itemName === "Báo sự cố") ||
      (filter === "found"    && item.itemName !== "Báo sự cố")
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (item.description ?? "").toLowerCase().includes(q) ||
      (item.roomNumber ?? "").toLowerCase().includes(q) ||
      (item.status ?? "").toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const incidentCount = items.filter(i => i.itemName === "Báo sự cố").length
  const foundCount    = items.filter(i => i.itemName !== "Báo sự cố").length

  return (
    <>
      <Header />
      <div className="bh-page">
        <div className="bh-header">
          <div className="container">
            <h1 className="bh-title"><WarningOutlined /> Sự Cố & Thất Lạc</h1>
            <p className="bh-sub">Báo cáo sự cố phòng và thông tin đồ thất lạc của bạn</p>
          </div>
        </div>

        <div className="container bh-body">
          {}
          <div className="bh-stats" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {[
              { label: "Tổng mục",        value: items.length, color: "#3b82f6", isCount: true },
              { label: "Báo cáo sự cố",   value: incidentCount, color: "#f59e0b", isCount: true },
              { label: "Đồ thất lạc",     value: foundCount,   color: "#22c55e", isCount: true },
            ].map(s => (
              <div key={s.label} className="bh-stat-card">
                <div className="bh-stat-num" style={{ color: s.color }}>{s.value}</div>
                <div className="bh-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {}
          <div className="bh-filters">
            <div className="bh-filter-tabs">
              {([
                { key: "all",      label: "Tất cả" },
                { key: "incident", label: "Báo cáo sự cố" },
                { key: "found",    label: "Đồ thất lạc" },
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
                placeholder="Tìm mô tả, số phòng..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {}
          {loading ? (
            <div className="bh-empty"><LoadingOutlined style={{ fontSize: 32 }} /></div>
          ) : filtered.length === 0 ? (
            <div className="bh-empty">
              <div className="bh-empty-icon"><WarningOutlined /></div>
              <p>{items.length === 0 ? "Chưa có sự cố hay đồ thất lạc nào" : "Không tìm thấy kết quả"}</p>
            </div>
          ) : (
            <div className="bh-txn-list">
              {filtered.map(item => {
                const isIncident = item.itemName === "Báo sự cố"
                const stKey = item.status ?? "Pending"
                const stCfg = STATUS_CFG[stKey] ?? STATUS_CFG.Pending
                return (
                  <div key={item.lostItemId} className="bh-txn-card">
                    {}
                    <div className="bh-txn-icon" style={{
                      background: isIncident ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                      color: isIncident ? "#ef4444" : "#f59e0b",
                    }}>
                      {isIncident ? <WarningOutlined /> : <ExclamationCircleOutlined />}
                    </div>

                    {}
                    <div className="bh-txn-info">
                      <div className="bh-txn-title">
                        {isIncident ? "Báo cáo sự cố" : `Đồ thất lạc: ${item.itemName}`}
                        {item.roomNumber && (
                          <span className="bh-txn-room">
                            {" "}· <HomeOutlined style={{ marginRight: 3 }} />Phòng {item.roomNumber}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: 13, color: "#475569", margin: "4px 0", lineHeight: 1.5 }}>
                          {item.description}
                        </div>
                      )}
                      <div className="bh-txn-meta">
                        <span><ClockCircleOutlined style={{ marginRight: 4 }} />
                          Gửi lúc: {fmtDate(item.createdAt)}
                        </span>
                        {item.foundAt && (
                          <>
                            <span style={{ color: "#cbd5e1" }}>·</span>
                            <span><CheckCircleOutlined style={{ marginRight: 4, color: "#22c55e" }} />
                              Tìm thấy: {fmtDate(item.foundAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {}
                    <div className="bh-txn-right">
                      <span className="bh-txn-status" style={{ color: stCfg.color, background: stCfg.bg }}>
                        {stCfg.icon} {stCfg.label}
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
