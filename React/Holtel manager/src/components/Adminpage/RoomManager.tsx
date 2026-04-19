import { SearchOutlined } from '@ant-design/icons'
import { useState, useEffect, useCallback } from 'react'
import Modal from './Modal'
import { apiSearch as apiSearchRooms, apiUpdate as apiUpdateRoom } from '../../services/RoomService'
import { apiGetAllBookings, apiCancelBooking } from '../../services/BookingService'
import { apiCreatePayment } from '../../services/PaymentService'
import { apiCreate as apiCreateInvoice } from '../../services/InvoiceService'
import '../../assets/css/Adminpage/RoomManager.css'

interface Room {
  id: number
  roomNumber: string
  currentStatus: string
  roomTypeId: number
  floor?: number
}

interface Booking {
  id: number
  roomId: number
  userId: string
  checkInDate: string
  checkOutDate: string
  totalPrice: number
  status: string
  numberOfGuests: number
  specialRequests?: string
}

type ModalMode = 'roomInfo' | 'checkout' | null

export default function RoomManager() {
  const [search, setSearch] = useState('')
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [paying, setPaying] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [roomRes, bookingRes] = await Promise.all([
        apiSearchRooms(1, 100),
        apiGetAllBookings(1, 100),
      ])
      setRooms(Array.isArray(roomRes) ? roomRes : roomRes?.data ?? [])
      setBookings(Array.isArray(bookingRes) ? bookingRes : bookingRes?.data ?? [])
    } catch (e) {
      // dùng mock nếu API chưa sẵn sàng
      setRooms([
        { id: 1, roomNumber: 'P101', currentStatus: 'Occupied', roomTypeId: 1, floor: 1 },
        { id: 2, roomNumber: 'P102', currentStatus: 'Available', roomTypeId: 1, floor: 1 },
        { id: 3, roomNumber: 'P103', currentStatus: 'Maintenance', roomTypeId: 2, floor: 1 },
        { id: 4, roomNumber: 'P201', currentStatus: 'Occupied', roomTypeId: 2, floor: 2 },
        { id: 5, roomNumber: 'P202', currentStatus: 'Available', roomTypeId: 1, floor: 2 },
        { id: 6, roomNumber: 'P203', currentStatus: 'Occupied', roomTypeId: 3, floor: 2 },
      ])
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const getBookingForRoom = (roomId: number) =>
    bookings.find(b => b.roomId === roomId && b.status === 'CheckedIn')

  const openRoomModal = (room: Room) => {
    const booking = getBookingForRoom(room.id)
    setSelectedRoom(room)
    setSelectedBooking(booking ?? null)
    setModalMode('roomInfo')
  }

  const handleCheckout = () => {
    setModalMode('checkout')
  }

  const handlePayAndCheckout = async () => {
    if (!selectedRoom || !selectedBooking) return
    setPaying(true)
    try {
      // 1. Tạo payment
      await apiCreatePayment({
        bookingId: selectedBooking.id,
        amount: selectedBooking.totalPrice,
        method: paymentMethod,
      })

      // 2. Tạo invoice
      await apiCreateInvoice({
        bookingId: selectedBooking.id,
        totalAmount: selectedBooking.totalPrice,
        paymentMethod,
        status: 'Paid',
      })

      // 3. Cancel (checkout) booking
      await apiCancelBooking(selectedBooking.id)

      // 4. Cập nhật trạng thái phòng → Available
      await apiUpdateRoom(selectedRoom.id, { currentStatus: 'Available' })

      showToast(`Thanh toán phòng ${selectedRoom.roomNumber} thành công!`)
      setModalMode(null)
      setSelectedRoom(null)
      setSelectedBooking(null)
      await loadData()
    } catch (e: any) {
      showToast(e?.response?.data || 'Thanh toán thất bại', 'err')
    } finally {
      setPaying(false)
    }
  }

  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    Occupied:    { label: 'Đang sử dụng', color: '#ef4444', dot: '#ef4444' },
    Available:   { label: 'Sẵn sàng',     color: '#22c55e', dot: '#22c55e' },
    Maintenance: { label: 'Bảo trì',       color: '#eab308', dot: '#eab308' },
    Reserved:    { label: 'Đã đặt',        color: '#3b82f6', dot: '#3b82f6' },
  }

  const getStatusCfg = (s: string) =>
    statusConfig[s] ?? { label: s, color: '#94a3b8', dot: '#94a3b8' }

  const filtered = rooms.filter(r =>
    r.roomNumber?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    occupied: rooms.filter(r => r.currentStatus === 'Occupied').length,
    available: rooms.filter(r => r.currentStatus === 'Available').length,
    maintenance: rooms.filter(r => r.currentStatus === 'Maintenance').length,
  }

  const formatVND = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

  const formatDate = (s: string) =>
    s ? new Date(s).toLocaleDateString('vi-VN') : '--'

  return (
    <div className="room-manager-wapper">

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem',
          background: toast.type === 'ok' ? '#166534' : '#7f1d1d',
          color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.3s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Đang sử dụng', val: stats.occupied, color: '#ef4444' },
          { label: 'Sẵn sàng', val: stats.available, color: '#22c55e' },
          { label: 'Bảo trì', val: stats.maintenance, color: '#eab308' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 12,
            padding: '14px 18px', border: `1px solid ${s.color}33`,
          }}>
            <div style={{ color: s.color, fontSize: '1.6rem', fontWeight: 700 }}>{s.val}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="room-manager-header">
        <div className="search-box">
          <SearchOutlined className="search-icon" />
          <input
            type="text"
            placeholder="Tìm phòng..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>
          Đang tải...
        </div>
      ) : (
        <div className="room-manager-body">
          <div className="body-manager">
            {filtered.map(room => {
              const cfg = getStatusCfg(room.currentStatus)
              const hasActiveBooking = !!getBookingForRoom(room.id)
              return (
                <div
                  key={room.id}
                  className="body-manager-room"
                  onClick={() => openRoomModal(room)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  <div className="body-left-manager-name">{room.roomNumber}</div>
                  <div
                    className="body-left-manager-status"
                    style={{ backgroundColor: cfg.dot }}
                    title={cfg.label}
                  />
                  {hasActiveBooking && (
                    <div style={{
                      position: 'absolute', top: -6, right: -6,
                      background: '#3b82f6', borderRadius: '50%',
                      width: 14, height: 14, fontSize: '0.55rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700,
                    }} title="Có booking đang CheckedIn">●</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        {Object.entries(statusConfig).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: v.dot }} />
            {v.label}
          </div>
        ))}
      </div>

      {/* Modal: Room Info */}
      {modalMode === 'roomInfo' && selectedRoom && (
        <Modal
          title={`Phòng ${selectedRoom.roomNumber}`}
          onClose={() => { setModalMode(null); setSelectedRoom(null) }}
          onSave={selectedRoom.currentStatus === 'Occupied' && selectedBooking ? handleCheckout : () => setModalMode(null)}
        >
          <div className="form-value">
            <div className="form-value-notchange">Mã phòng: <b>{selectedRoom.id}</b></div>
            <div className="form-value-notchange">Số phòng: <b>{selectedRoom.roomNumber}</b></div>
            <div className="form-value-notchange">
              Trạng thái:{' '}
              <span style={{ color: getStatusCfg(selectedRoom.currentStatus).color, fontWeight: 700 }}>
                {getStatusCfg(selectedRoom.currentStatus).label}
              </span>
            </div>

            {selectedBooking ? (
              <>
                <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: 8 }}>THÔNG TIN BOOKING</div>
                  <div className="form-value-notchange">Booking ID: <b>#{selectedBooking.id}</b></div>
                  <div className="form-value-notchange">Nhận phòng: <b>{formatDate(selectedBooking.checkInDate)}</b></div>
                  <div className="form-value-notchange">Trả phòng: <b>{formatDate(selectedBooking.checkOutDate)}</b></div>
                  <div className="form-value-notchange">Số khách: <b>{selectedBooking.numberOfGuests}</b></div>
                  <div className="form-value-notchange">
                    Tổng tiền: <b style={{ color: '#22c55e' }}>{formatVND(selectedBooking.totalPrice)}</b>
                  </div>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: 8 }}>
                  Nhấn "Lưu" để mở màn hình thanh toán & checkout.
                </p>
              </>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: 8 }}>
                {selectedRoom.currentStatus === 'Available'
                  ? 'Phòng đang trống, sẵn sàng nhận khách.'
                  : 'Không có booking CheckedIn cho phòng này.'}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal: Checkout & Payment */}
      {modalMode === 'checkout' && selectedRoom && selectedBooking && (
        <Modal
          title="Thanh toán & Checkout"
          onClose={() => setModalMode('roomInfo')}
          onSave={handlePayAndCheckout}
        >
          <div className="form-value">
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: 12 }}>CHI TIẾT HOÁ ĐƠN</div>

            {[
              ['Phòng', selectedRoom.roomNumber],
              ['Booking ID', `#${selectedBooking.id}`],
              ['Nhận phòng', formatDate(selectedBooking.checkInDate)],
              ['Trả phòng', formatDate(selectedBooking.checkOutDate)],
              ['Số khách', String(selectedBooking.numberOfGuests)],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>{label}</span>
                <span style={{ color: '#fff', fontWeight: 500, fontSize: '0.88rem' }}>{val}</span>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginTop: 4 }}>
              <span style={{ color: '#fff', fontWeight: 700 }}>Tổng tiền</span>
              <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '1.1rem' }}>
                {formatVND(selectedBooking.totalPrice)}
              </span>
            </div>

            <div className="form-group" style={{ marginTop: 8 }}>
              <label>Phương thức thanh toán</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="Cash">Tiền mặt</option>
                <option value="Card">Thẻ ngân hàng</option>
                <option value="Transfer">Chuyển khoản</option>
              </select>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: 8 }}>
              {paying ? '⏳ Đang xử lý thanh toán...' : 'Nhấn "Lưu" để xác nhận thanh toán. Hoá đơn sẽ được lưu tự động.'}
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}