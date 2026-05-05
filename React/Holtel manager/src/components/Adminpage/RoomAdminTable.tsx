import { useState, useEffect, useCallback } from 'react'
import { PlusOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined, EditOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons'
import { apiClient } from '../../constant/api'
import { API } from '../../constant/config'

interface RoomType { id: number; name: string }
interface Room {
  roomId: number
  roomNumber: string
  roomTypeId: number
  roomTypeName?: string
  currentStatus: string
}

const STATUS_COLOR: Record<string, string> = {
  Available:   '#22c55e',
  Occupied:    '#ef4444',
  Maintenance: '#f59e0b',
  Reserved:    '#3b82f6',
}
const STATUS_LABEL: Record<string, string> = {
  Available:   'Còn trống',
  Occupied:    'Đang ở',
  Maintenance: 'Bảo trì',
  Reserved:    'Đã đặt',
}

export default function RoomAdminTable() {
  const [rooms, setRooms]         = useState<Room[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [showAdd, setShowAdd]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [editId, setEditId]       = useState<number | null>(null)
  const [editStatus, setEditStatus] = useState('')

  const [form, setForm] = useState({ roomNumber: '', roomTypeId: 0, currentStatus: 'Available' })

  const loadRooms = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get(`${API}/rooms?page=1&limit=200`)
      const raw = res.data
      setRooms(Array.isArray(raw) ? raw : raw?.data ?? [])
    } catch { setRooms([]) }
    finally { setLoading(false) }
  }, [])

  const loadRoomTypes = useCallback(async () => {
    try {
      const res = await apiClient.get(`${API}/roomtype?page=1&limit=100`)
      const raw = res.data
      const list = Array.isArray(raw) ? raw : raw?.data ?? []
      setRoomTypes(list.map((rt: any) => ({
        id: rt.id ?? rt.roomTypeId,
        name: rt.name,
      })))
    } catch { setRoomTypes([]) }
  }, [])

  useEffect(() => { loadRooms(); loadRoomTypes() }, [loadRooms, loadRoomTypes])

  const handleAdd = async () => {
    if (!form.roomNumber.trim()) { setError('Vui lòng nhập số phòng'); return }
    if (!form.roomTypeId) { setError('Vui lòng chọn loại phòng'); return }
    setSaving(true); setError('')
    try {
      await apiClient.post(`${API}/rooms`, form)
      setShowAdd(false)
      setForm({ roomNumber: '', roomTypeId: 0, currentStatus: 'Available' })
      await loadRooms()
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.response?.data ?? 'Không thể thêm phòng')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa phòng này?')) return
    try {
      await apiClient.delete(`${API}/rooms/${id}`)
      setRooms(prev => prev.filter(r => r.roomId !== id))
    } catch (e: any) { alert(e?.response?.data ?? 'Không thể xóa') }
  }

  const handleSaveStatus = async (room: Room) => {
    try {
      await apiClient.put(`${API}/rooms/${room.roomId}`, { ...room, currentStatus: editStatus })
      setRooms(prev => prev.map(r => r.roomId === room.roomId ? { ...r, currentStatus: editStatus } : r))
      setEditId(null)
    } catch { alert('Không thể cập nhật') }
  }

  const filtered = rooms.filter(r =>
    JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
  )

  const getRoomTypeName = (id: number) => roomTypes.find(rt => rt.id === id)?.name ?? `#${id}`

  return (
    <div style={{ padding: '24px 28px' }}>
      {}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 20, fontWeight: 800 }}>Quản lý Phòng</h2>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{rooms.length} phòng</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={loadRooms} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>
            <ReloadOutlined />
          </button>
          <button onClick={() => { setShowAdd(true); setError('') }}
            style={{ background: '#3b82f6', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <PlusOutlined /> Thêm phòng
          </button>
        </div>
      </div>

      {}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <SearchOutlined style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm số phòng, loại phòng, trạng thái..."
          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 12px 10px 36px', color: '#fff', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
      </div>

      {}
      {showAdd && (
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
          <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Thêm phòng mới</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Số phòng *</label>
              <input value={form.roomNumber} onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))}
                placeholder="VD: 101, A201..."
                style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Loại phòng *</label>
              <select value={form.roomTypeId} onChange={e => setForm(f => ({ ...f, roomTypeId: Number(e.target.value) }))}
                style={{ width: '100%', background: '#1a2535', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 12px', color: form.roomTypeId ? '#fff' : 'rgba(255,255,255,0.35)', fontSize: 14, boxSizing: 'border-box', outline: 'none' }}>
                <option value={0}>-- Chọn loại phòng --</option>
                {roomTypes.map(rt => (
                  <option key={rt.id} value={rt.id}>{rt.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Trạng thái</label>
              <select value={form.currentStatus} onChange={e => setForm(f => ({ ...f, currentStatus: e.target.value }))}
                style={{ width: '100%', background: '#1a2535', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 14, boxSizing: 'border-box', outline: 'none' }}>
                {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          {error && <div style={{ color: '#f87171', fontSize: 13, marginTop: 10 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={() => { setShowAdd(false); setError('') }}
              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 13 }}>
              Hủy
            </button>
            <button onClick={handleAdd} disabled={saving}
              style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: saving ? '#475569' : '#3b82f6', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13 }}>
              {saving ? 'Đang lưu...' : 'Thêm phòng'}
            </button>
          </div>
        </div>
      )}

      {}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>Đang tải...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['ID', 'Số phòng', 'Loại phòng', 'Trạng thái', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(room => (
              <tr key={room.roomId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '11px 14px', color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>#{room.roomId}</td>
                <td style={{ padding: '11px 14px' }}>
                  <span style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 6, padding: '3px 10px', color: '#60a5fa', fontWeight: 700 }}>
                    {room.roomNumber}
                  </span>
                </td>
                <td style={{ padding: '11px 14px', color: 'rgba(255,255,255,0.75)' }}>
                  {room.roomTypeName ?? getRoomTypeName(room.roomTypeId)}
                </td>
                <td style={{ padding: '11px 14px' }}>
                  {editId === room.roomId ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                        style={{ background: '#1a2535', border: `1px solid ${STATUS_COLOR[editStatus] ?? '#475569'}`, borderRadius: 6, padding: '4px 10px', color: STATUS_COLOR[editStatus] ?? '#94a3b8', fontSize: 13, fontWeight: 600, outline: 'none' }}>
                        {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <button onClick={() => handleSaveStatus(room)} style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }}><CheckOutlined /></button>
                      <button onClick={() => setEditId(null)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }}><CloseOutlined /></button>
                    </div>
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: `${STATUS_COLOR[room.currentStatus] ?? '#475569'}18`,
                      border: `1px solid ${STATUS_COLOR[room.currentStatus] ?? '#475569'}40`,
                      borderRadius: 6, padding: '3px 10px',
                      color: STATUS_COLOR[room.currentStatus] ?? '#94a3b8',
                      fontSize: 13, fontWeight: 600,
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLOR[room.currentStatus] ?? '#94a3b8', display: 'inline-block' }} />
                      {STATUS_LABEL[room.currentStatus] ?? room.currentStatus}
                    </span>
                  )}
                </td>
                <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => { setEditId(room.roomId); setEditStatus(room.currentStatus) }}
                      style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12 }}>
                      <EditOutlined />
                    </button>
                    <button onClick={() => handleDelete(room.roomId)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12 }}>
                      <DeleteOutlined />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>Chưa có phòng nào</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
