import { useState, useEffect, useCallback } from 'react'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, CloseOutlined,
  CheckCircleOutlined, StopOutlined, TagsOutlined, LoadingOutlined,
} from '@ant-design/icons'
import { apiClient } from '../../constant/api'
import { API } from '../../constant/config'
import '../../assets/css/Adminpage/RoomRateManager.css'

interface RoomType { id: number; name: string }
interface RoomRate {
  roomRateId: number
  roomTypeId: number
  roomTypeName?: string
  rentType: string
  price: number
  fromDate?: string
  toDate?: string
  isActive: boolean
  createdAt?: string
}

const RENT_TYPES = ['Night', 'Day', 'Hour', 'Weekend', 'Holiday', 'Weekday']
const RENT_LABELS: Record<string, string> = {
  Night: 'Theo đêm', Day: 'Theo ngày', Hour: 'Theo giờ',
  Weekend: 'Cuối tuần', Holiday: 'Ngày lễ', Weekday: 'Ngày thường',
}
const RENT_COLORS: Record<string, string> = {
  Night: '#8b5cf6', Day: '#3b82f6', Hour: '#f59e0b',
  Weekend: '#ec4899', Holiday: '#ef4444', Weekday: '#22c55e',
}

const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v ?? 0)
const fmtD = (s?: string) => s ? new Date(s).toLocaleDateString('vi-VN') : '—'

const EMPTY_FORM = {
  roomTypeId: 0, rentType: 'Night', price: 0,
  fromDate: '', toDate: '', isActive: true,
}

export default function RoomRateManager() {
  const [rates, setRates]         = useState<RoomRate[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading]     = useState(true)
  const [filterRT, setFilterRT]   = useState(0)   
  const [filterType, setFilterType] = useState('')

  const [showForm, setShowForm]   = useState(false)
  const [editId, setEditId]       = useState<number | null>(null)
  const [form, setForm]           = useState({ ...EMPTY_FORM })
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState<number | null>(null)

  const loadRates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get(`${API}/roomrate?page=1&limit=200`)
      const raw = res.data
      setRates(Array.isArray(raw) ? raw : raw?.data ?? [])
    } catch { setRates([]) }
    finally { setLoading(false) }
  }, [])

  const loadRoomTypes = useCallback(async () => {
    try {
      const res = await apiClient.get(`${API}/roomtype?page=1&limit=100`)
      const raw = res.data
      const items: RoomType[] = Array.isArray(raw) ? raw : raw?.data ?? []
      setRoomTypes(items)
      if (items.length > 0 && form.roomTypeId === 0)
        setForm(f => ({ ...f, roomTypeId: items[0].id }))
    } catch { setRoomTypes([]) }
  }, [])

  useEffect(() => { loadRates(); loadRoomTypes() }, [])

  const openCreate = () => {
    setEditId(null)
    setForm({ ...EMPTY_FORM, roomTypeId: roomTypes[0]?.id ?? 0 })
    setShowForm(true)
  }

  const openEdit = (r: RoomRate) => {
    setEditId(r.roomRateId)
    setForm({
      roomTypeId: r.roomTypeId,
      rentType:   r.rentType ?? 'Night',
      price:      r.price ?? 0,
      fromDate:   r.fromDate ? r.fromDate.split('T')[0] : '',
      toDate:     r.toDate   ? r.toDate.split('T')[0]   : '',
      isActive:   r.isActive ?? true,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.roomTypeId) { alert('Vui lòng chọn loại phòng'); return }
    if (!form.price || form.price <= 0) { alert('Vui lòng nhập giá hợp lệ'); return }
    setSaving(true)
    try {
      const payload = {
        roomTypeId: form.roomTypeId,
        rentType:   form.rentType,
        price:      form.price,
        fromDate:   form.fromDate || null,
        toDate:     form.toDate   || null,
        isActive:   form.isActive,
      }
      if (editId) {
        await apiClient.put(`${API}/roomrate/${editId}`, payload)
      } else {
        await apiClient.post(`${API}/roomrate`, payload)
      }
      setShowForm(false)
      await loadRates()
    } catch (e: any) {
      alert(e?.response?.data ?? 'Lưu thất bại')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa mức giá này?')) return
    setDeleting(id)
    try {
      await apiClient.delete(`${API}/roomrate/${id}`)
      await loadRates()
    } catch { alert('Xóa thất bại') }
    finally { setDeleting(null) }
  }

  const filtered = rates.filter(r => {
    const matchRT   = filterRT === 0 || r.roomTypeId === filterRT
    const matchType = !filterType || r.rentType === filterType
    return matchRT && matchType
  })

  const getRTName = (id: number) => roomTypes.find(rt => rt.id === id)?.name ?? `#${id}`

  return (
    <div className="rrm-wrapper">

      {}
      <div className="rrm-header">
        <div>
          <h2 className="rrm-title"><TagsOutlined /> Quản lý giá phòng</h2>
          <p className="rrm-sub">Tạo nhiều mức giá theo loại phòng và thời điểm</p>
        </div>
        <button className="rrm-btn-add" onClick={openCreate}>
          <PlusOutlined /> Thêm mức giá
        </button>
      </div>

      {}
      <div className="rrm-filters">
        <select
          className="rrm-filter-select"
          value={filterRT}
          onChange={e => setFilterRT(Number(e.target.value))}
        >
          <option value={0}>Tất cả loại phòng</option>
          {roomTypes.map(rt => (
            <option key={rt.id} value={rt.id}>{rt.name}</option>
          ))}
        </select>
        <select
          className="rrm-filter-select"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="">Tất cả loại giá</option>
          {RENT_TYPES.map(t => (
            <option key={t} value={t}>{RENT_LABELS[t]}</option>
          ))}
        </select>
        <span className="rrm-count">{filtered.length} mức giá</span>
      </div>

      {}
      {loading ? (
        <div className="rrm-loading"><LoadingOutlined /> Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className="rrm-empty">
          <TagsOutlined style={{ fontSize: 40, opacity: 0.3 }} />
          <p>Chưa có mức giá nào</p>
          <button className="rrm-btn-add" onClick={openCreate}><PlusOutlined /> Thêm mức giá đầu tiên</button>
        </div>
      ) : (
        <div className="rrm-grid">
          {filtered.map(r => {
            const color = RENT_COLORS[r.rentType] ?? '#94a3b8'
            return (
              <div key={r.roomRateId} className={`rrm-card${r.isActive ? '' : ' inactive'}`}>
                <div className="rrm-card-top">
                  <span className="rrm-type-badge" style={{ background: `${color}20`, color }}>
                    {RENT_LABELS[r.rentType] ?? r.rentType}
                  </span>
                  <span className={`rrm-active-badge ${r.isActive ? 'on' : 'off'}`}>
                    {r.isActive ? <><CheckCircleOutlined /> Đang dùng</> : <><StopOutlined /> Tắt</>}
                  </span>
                </div>

                <div className="rrm-card-rt">{getRTName(r.roomTypeId)}</div>

                <div className="rrm-card-price" style={{ color }}>
                  {fmt(r.price)}
                  <span className="rrm-card-unit">/ {RENT_LABELS[r.rentType]?.toLowerCase() ?? r.rentType}</span>
                </div>

                {(r.fromDate || r.toDate) && (
                  <div className="rrm-card-period">
                    {r.fromDate && <span>Từ {fmtD(r.fromDate)}</span>}
                    {r.toDate && <span> → {fmtD(r.toDate)}</span>}
                  </div>
                )}

                <div className="rrm-card-actions">
                  <button className="rrm-action-btn edit" onClick={() => openEdit(r)}>
                    <EditOutlined />
                  </button>
                  <button className="rrm-action-btn del"
                    disabled={deleting === r.roomRateId}
                    onClick={() => handleDelete(r.roomRateId)}>
                    {deleting === r.roomRateId ? <LoadingOutlined /> : <DeleteOutlined />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {}
      {showForm && (
        <div className="rrm-overlay" onClick={() => setShowForm(false)}>
          <div className="rrm-modal" onClick={e => e.stopPropagation()}>
            <div className="rrm-modal-header">
              <span className="rrm-modal-title">
                {editId ? 'Sửa mức giá' : 'Thêm mức giá mới'}
              </span>
              <button className="rrm-modal-close" onClick={() => setShowForm(false)}>
                <CloseOutlined />
              </button>
            </div>

            <div className="rrm-modal-body">
              <div className="rrm-field">
                <label>Loại phòng <span className="req">*</span></label>
                <select
                  value={form.roomTypeId}
                  onChange={e => setForm(f => ({ ...f, roomTypeId: Number(e.target.value) }))}
                >
                  <option value={0} disabled>-- Chọn loại phòng --</option>
                  {roomTypes.map(rt => (
                    <option key={rt.id} value={rt.id}>{rt.name}</option>
                  ))}
                </select>
              </div>

              <div className="rrm-field">
                <label>Loại giá <span className="req">*</span></label>
                <div className="rrm-type-grid">
                  {RENT_TYPES.map(t => {
                    const color = RENT_COLORS[t]
                    return (
                      <button
                        key={t}
                        type="button"
                        className={`rrm-type-opt${form.rentType === t ? ' sel' : ''}`}
                        style={form.rentType === t ? { borderColor: color, background: `${color}20`, color } : {}}
                        onClick={() => setForm(f => ({ ...f, rentType: t }))}
                      >
                        {RENT_LABELS[t]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rrm-field">
                <label>Giá (₫) <span className="req">*</span></label>
                <input
                  type="number" min={0} step={10000}
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                  placeholder="VD: 500000"
                />
                {form.price > 0 && (
                  <div className="rrm-price-preview">{fmt(form.price)}</div>
                )}
              </div>

              <div className="rrm-field-row">
                <div className="rrm-field">
                  <label>Hiệu lực từ ngày</label>
                  <input type="date" value={form.fromDate}
                    onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} />
                </div>
                <div className="rrm-field">
                  <label>Đến ngày</label>
                  <input type="date" value={form.toDate}
                    onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} />
                </div>
              </div>

              <div className="rrm-field rrm-field-check">
                <label className="rrm-check-label">
                  <input type="checkbox" checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                  <span>Đang áp dụng</span>
                </label>
              </div>
            </div>

            <div className="rrm-modal-footer">
              <button className="rrm-btn-cancel" onClick={() => setShowForm(false)}>Hủy</button>
              <button className="rrm-btn-save" disabled={saving} onClick={handleSave}>
                {saving ? <><LoadingOutlined /> Đang lưu...</> : <><CheckCircleOutlined /> Lưu mức giá</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
