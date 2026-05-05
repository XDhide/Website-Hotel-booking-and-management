import { useState, useEffect, useCallback } from 'react'
import {
  BugOutlined, PlusOutlined, ReloadOutlined,
  EditOutlined, DeleteOutlined, CheckCircleOutlined,
  ClockCircleOutlined, CloseOutlined, LoadingOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { apiClient } from '../../constant/api'
import { API } from '../../constant/config'

interface Room { roomId: number; roomNumber: string; roomTypeId: number }
interface RoomInUse { roomUseId: number; roomId: number; status: string; bookingId?: number }
interface Incident {
  lostItemId: number
  roomId?: number
  roomUseId?: number
  itemName: string
  description?: string
  status: string
  foundAt?: string
  createdAt?: string
  roomNumber?: string
}

const fmt = (s?: string) => {
  if (!s) return '—'
  try { return new Date(s).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) }
  catch { return s }
}

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  Pending:  { label: 'Chờ xử lý',   color: '#f59e0b' },
  Lost:     { label: 'Thất lạc',    color: '#ef4444' },
  Found:    { label: 'Đã tìm thấy', color: '#22c55e' },
  Returned: { label: 'Đã trả lại',  color: '#3b82f6' },
  Resolved: { label: 'Đã xử lý',   color: '#22c55e' },
}

const EMPTY_FORM = {
  roomId: 0, roomUseId: 0, itemName: '', description: '',
  status: 'Pending', foundAt: '',
}

export default function IncidentAdminTable() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [rooms, setRooms]         = useState<Room[]>([])
  const [roomInUses, setRoomInUses] = useState<RoomInUse[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editItem, setEditItem]   = useState<Incident | null>(null)
  const [form, setForm]           = useState({ ...EMPTY_FORM })
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [incRes, roomRes, riRes] = await Promise.all([
        apiClient.get(`${API}/lostitem?page=1&limit=100`),
        apiClient.get(`${API}/rooms?page=1&limit=200`),
        apiClient.get(`${API}/roominuse?page=1&limit=200`).catch(() => ({ data: { data: [] } })),
      ])
      const incList = incRes.data?.data ?? incRes.data ?? []
      setIncidents(Array.isArray(incList) ? incList : [])
      const roomList = roomRes.data?.data ?? roomRes.data ?? []
      setRooms(Array.isArray(roomList) ? roomList : [])
      const riList = riRes.data?.data ?? riRes.data ?? []
      setRoomInUses(Array.isArray(riList) ? riList : [])
    } catch { setIncidents([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setEditItem(null)
    setForm({ ...EMPTY_FORM })
    setError('')
    setShowForm(true)
  }

  const openEdit = (item: Incident) => {
    setEditItem(item)
    setForm({
      roomId: item.roomId ?? 0,
      roomUseId: item.roomUseId ?? 0,
      itemName: item.itemName ?? '',
      description: item.description ?? '',
      status: item.status ?? 'Pending',
      foundAt: item.foundAt ? item.foundAt.split('T')[0] : '',
    })
    setError('')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.itemName.trim()) { setError('Vui lòng nhập tên / tiêu đề sự cố'); return }
    if (!form.roomId) { setError('Vui lòng chọn phòng'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        roomId:      form.roomId,
        roomUseId:   form.roomUseId || null,
        itemName:    form.itemName,
        description: form.description,
        status:      form.status,
        foundAt:     form.foundAt ? new Date(form.foundAt).toISOString() : null,
      }
      if (editItem) {
        await apiClient.put(`${API}/lostitem/${editItem.lostItemId}`, payload)
      } else {
        await apiClient.post(`${API}/lostitem`, payload)
      }
      setShowForm(false)
      await load()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.response?.data ?? e?.message ?? 'Lỗi lưu dữ liệu')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa sự cố này?')) return
    try {
      await apiClient.delete(`${API}/lostitem/${id}`)
      setIncidents(prev => prev.filter(i => i.lostItemId !== id))
    } catch (e: any) {
      alert(e?.response?.data ?? 'Không thể xóa')
    }
  }

  
  const riForRoom = roomInUses.filter(r => r.roomId === Number(form.roomId))

  return (
    <div style={{ padding: '24px 28px' }}>
      {}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <BugOutlined /> Quản lý Sự cố
          </h2>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            Báo cáo sự cố và đồ thất lạc từ các phòng
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
          }}><ReloadOutlined /></button>
          <button onClick={openAdd} style={{
            background: '#3b82f6', border: 'none', color: '#fff',
            borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <PlusOutlined /> Thêm sự cố
          </button>
        </div>
      </div>

      {}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>
          <LoadingOutlined style={{ fontSize: 28 }} />
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['#', 'Phòng', 'Tiêu đề / Tên vật', 'Mô tả', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map(h => (
                  <th key={h} style={{
                    padding: '10px 12px', textAlign: 'left',
                    color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: 11,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidents.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>Chưa có sự cố nào</td></tr>
              ) : incidents.map(inc => {
                const stCfg = STATUS_CFG[inc.status] ?? { label: inc.status, color: '#94a3b8' }
                return (
                  <tr key={inc.lostItemId} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px', color: 'rgba(255,255,255,0.4)' }}>#{inc.lostItemId}</td>
                    <td style={{ padding: '12px', color: '#fff', fontWeight: 600 }}>
                      <HomeOutlined style={{ marginRight: 6, color: '#60a5fa' }} />
                      {inc.roomNumber ? `Phòng ${inc.roomNumber}` : (inc.roomId ? `ID ${inc.roomId}` : '—')}
                    </td>
                    <td style={{ padding: '12px', color: '#fff', fontWeight: 600, maxWidth: 180 }}>
                      {inc.itemName}
                    </td>
                    <td style={{ padding: '12px', color: 'rgba(255,255,255,0.6)', maxWidth: 240 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {inc.description || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        background: stCfg.color + '22', color: stCfg.color,
                        border: `1px solid ${stCfg.color}44`,
                        borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                      }}>
                        {inc.status === 'Resolved' || inc.status === 'Found' || inc.status === 'Returned'
                          ? <CheckCircleOutlined />
                          : <ClockCircleOutlined />
                        }
                        {stCfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                      {fmt(inc.createdAt)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(inc)} style={{
                          padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.3)',
                          background: 'rgba(59,130,246,0.1)', color: '#60a5fa', cursor: 'pointer', fontSize: 12,
                        }}><EditOutlined /></button>
                        <button onClick={() => handleDelete(inc.lostItemId)} style={{
                          padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)',
                          background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', fontSize: 12,
                        }}><DeleteOutlined /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: '#1e293b', borderRadius: 16, width: 520, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}>

            {}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>
                <BugOutlined style={{ marginRight: 8, color: '#f87171' }} />
                {editItem ? 'Chỉnh sửa sự cố' : 'Thêm sự cố mới'}
              </span>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18 }}>
                <CloseOutlined />
              </button>
            </div>

            {}
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Phòng *
                </label>
                <select
                  value={form.roomId}
                  onChange={e => setForm(f => ({ ...f, roomId: Number(e.target.value), roomUseId: 0 }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 13 }}
                >
                  <option value={0}>-- Chọn phòng --</option>
                  {rooms.map(r => (
                    <option key={r.roomId} value={r.roomId}>Phòng {r.roomNumber}</option>
                  ))}
                </select>
              </div>

              {}
              {riForRoom.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Lượt lưu trú (tuỳ chọn)
                  </label>
                  <select
                    value={form.roomUseId}
                    onChange={e => setForm(f => ({ ...f, roomUseId: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 13 }}
                  >
                    <option value={0}>-- Không chọn --</option>
                    {riForRoom.map(r => (
                      <option key={r.roomUseId} value={r.roomUseId}>
                        Lượt #{r.roomUseId} — {r.status}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tên / Tiêu đề sự cố *
                </label>
                <input
                  type="text"
                  value={form.itemName}
                  onChange={e => setForm(f => ({ ...f, itemName: e.target.value }))}
                  placeholder="VD: Điều hòa hỏng, Đồ thất lạc..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              {}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Mô tả chi tiết
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả chi tiết sự cố hoặc đồ thất lạc..."
                  rows={4}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              {}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Ngày tìm thấy / giải quyết (tuỳ chọn)
                </label>
                <input
                  type="date"
                  value={form.foundAt}
                  onChange={e => setForm(f => ({ ...f, foundAt: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              {}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Trạng thái
                </label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 13 }}
                >
                  <option value="Pending">Chờ xử lý</option>
                  <option value="Lost">Thất lạc</option>
                  <option value="Found">Đã tìm thấy</option>
                  <option value="Returned">Đã trả lại</option>
                  <option value="Resolved">Đã xử lý</option>
                </select>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                  {error}
                </div>
              )}
            </div>

            {}
            <div style={{ display: 'flex', gap: 10, padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button onClick={() => setShowForm(false)} style={{
                flex: 1, padding: '10px', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer', fontSize: 14,
              }}>Hủy</button>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 2, padding: '10px', border: 'none', borderRadius: 8,
                background: saving ? '#475569' : '#3b82f6', color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700,
              }}>
                {saving ? <><LoadingOutlined style={{ marginRight: 6 }} />Đang lưu...</> : (editItem ? 'Cập nhật' : 'Thêm sự cố')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
