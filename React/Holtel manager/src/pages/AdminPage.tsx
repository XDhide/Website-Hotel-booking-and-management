import { useState } from 'react'
import Sidebar from '../components/Adminpage/Sidebar'
import HomeAdmin from '../components/Adminpage/Homeadmin'
import SupportChat from '../components/Adminpage/SupportChat'
import Payment from '../components/Adminpage/Payment'
import Report from '../components/Adminpage/Report'
import Settings from '../components/Adminpage/Setting'
import ApiDataTable from '../components/Adminpage/DataTable'
import { API } from '../constant/config'
import '../assets/css/Adminpage/AdminPage.css'

export type PageKey =
  | 'home' | 'users' | 'roomTypes' | 'support' | 'settings'
  | 'room' | 'bill' | 'serve' | 'voucher' | 'lost' | 'incident' | 'report'

const Badge = ({ value, color = '#22c55e' }: { value: string; color?: string }) => (
  <span style={{
    padding: '2px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600,
    background: `${color}20`, color,
  }}>{value}</span>
)

const ROOM_STATUS: Record<string, { label: string; color: string }> = {
  Available:   { label: 'Trống',         color: '#22c55e' },
  Occupied:    { label: 'Đang sử dụng',  color: '#ef4444' },
  Maintenance: { label: 'Bảo trì',        color: '#eab308' },
  Reserved:    { label: 'Đã đặt',         color: '#3b82f6' },
}
const INCIDENT_COLOR: Record<string, string> = {
  Pending: '#eab308', Resolved: '#22c55e', Cancelled: '#ef4444',
}
const LOST_COLOR: Record<string, string> = {
  Lost: '#ef4444', Found: '#eab308', Returned: '#22c55e',
}

const fmt  = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)
const fmtD = (s: string) => { try { return new Date(s).toLocaleDateString('vi-VN') } catch { return s } }

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState<PageKey>('home')

  return (
    <div className="admin-layout">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="admin-content">

        {currentPage === 'home' && (
          <div className="page-section">
            <h1>Trang chủ</h1>
            <HomeAdmin />
          </div>
        )}

        {/* NGƯỜI DÙNG — GET /Account/userlist → { page, limit, totalCount, totalPages, data: [{Id,Username,Email,Roles}] } */}
        {currentPage === 'users' && (
          <ApiDataTable
            apiPrefix="Account"
            customGetUrl={(p, l) => `${API}/Account/userlist?page=${p}&limit=${l}`}
            pageSize={10}
            emptyForm={{ username: '', email: '' }}
            fieldsMeta={{
              username: { label: 'Tên đăng nhập', readOnly: true },
              email:    { label: 'Email',          readOnly: true },
              roles:    { label: 'Vai trò',
                          render: (v) => Array.isArray(v)
                            ? v.map((r: string) => <Badge key={r} value={r} color="#3b82f6" />)
                            : <Badge value={String(v)} color="#3b82f6" /> },
            }}
          />
        )}

        {/* LOẠI PHÒNG — model RoomType { name, capacity, description } */}
        {currentPage === 'roomTypes' && (
          <ApiDataTable apiPrefix="RoomType" pageSize={10}
            emptyForm={{ name: '', capacity: '', description: '' }}
            fieldsMeta={{
              name:        { label: 'Tên loại phòng', inputType: 'text' },
              capacity:    { label: 'Sức chứa',       inputType: 'text' },
              description: { label: 'Mô tả',          inputType: 'textarea' },
            }} />
        )}

        {/* PHÒNG — model Rooms { roomNumber, roomTypeId, currentStatus } */}
        {currentPage === 'room' && (
          <ApiDataTable apiPrefix="room" pageSize={10}
            emptyForm={{ roomNumber: '', roomTypeId: 1, currentStatus: 'Available' }}
            fieldsMeta={{
              roomNumber:    { label: 'Số phòng',      inputType: 'text' },
              roomTypeId:    { label: 'Mã loại phòng', inputType: 'number' },
              currentStatus: {
                label: 'Trạng thái', inputType: 'select',
                options: ['Available', 'Occupied', 'Maintenance', 'Reserved'],
                render: (v) => {
                  const s = ROOM_STATUS[v] ?? { label: v, color: '#94a3b8' }
                  return <Badge value={s.label} color={s.color} />
                },
              },
            }} />
        )}

        {currentPage === 'bill' && <Payment />}

        {/* DỊCH VỤ — model Services { serviceType, name, price, unit } */}
        {currentPage === 'serve' && (
          <ApiDataTable apiPrefix="Service" pageSize={10}
            emptyForm={{ serviceType: '', name: '', price: 0, unit: '' }}
            fieldsMeta={{
              serviceType: { label: 'Loại',      inputType: 'text' },
              name:        { label: 'Tên',        inputType: 'text' },
              price:       { label: 'Giá',        inputType: 'number', render: (v) => fmt(Number(v)) },
              unit:        { label: 'Đơn vị',     inputType: 'text' },
            }} />
        )}

        {/* GIẢM GIÁ — model Discount { name, discountType, discountValue, fromDate, toDate, isActive } */}
        {currentPage === 'voucher' && (
          <ApiDataTable apiPrefix="Discount" pageSize={10}
            emptyForm={{ name: '', discountType: 'Percentage', discountValue: 0, fromDate: '', toDate: '', isActive: true }}
            fieldsMeta={{
              name:          { label: 'Tên',       inputType: 'text' },
              discountType:  { label: 'Loại',      inputType: 'select', options: ['Percentage', 'Fixed'],
                               render: (v) => <Badge value={v} color={v === 'Percentage' ? '#3b82f6' : '#8b5cf6'} /> },
              discountValue: { label: 'Giá trị',   inputType: 'number',
                               render: (v, row) => row.discountType === 'Percentage' ? `${v}%` : fmt(Number(v)) },
              fromDate:      { label: 'Từ ngày',   inputType: 'text', render: (v) => fmtD(v) },
              toDate:        { label: 'Đến ngày',  inputType: 'text', render: (v) => fmtD(v) },
              isActive:      { label: 'Trạng thái',
                               render: (v) => <Badge value={v ? 'Đang dùng' : 'Tắt'} color={v ? '#22c55e' : '#6b7280'} /> },
            }} />
        )}

        {/* ĐỒ THẤT LẠC — model LostItem { bookingId, itemName, description, status, foundDate } */}
        {currentPage === 'lost' && (
          <ApiDataTable apiPrefix="LostItem" pageSize={10}
            emptyForm={{ bookingId: 0, itemName: '', description: '', status: 'Lost', foundDate: '' }}
            fieldsMeta={{
              bookingId:   { label: 'Booking ID',      inputType: 'number' },
              itemName:    { label: 'Tên đồ vật',      inputType: 'text' },
              description: { label: 'Mô tả',           inputType: 'textarea' },
              foundDate:   { label: 'Ngày tìm thấy',  inputType: 'text', render: (v) => fmtD(v) },
              status:      { label: 'Trạng thái',      inputType: 'select',
                             options: ['Lost', 'Found', 'Returned'],
                             render: (v) => <Badge value={v} color={LOST_COLOR[v] ?? '#94a3b8'} /> },
            }} />
        )}

        {/* SỰ CỐ — model Incident { bookingId, title, description, status } */}
        {currentPage === 'incident' && (
          <ApiDataTable apiPrefix="Incident" pageSize={10}
            emptyForm={{ bookingId: 0, title: '', description: '', status: 'Pending' }}
            fieldsMeta={{
              bookingId:   { label: 'Booking ID',  inputType: 'number' },
              title:       { label: 'Tiêu đề',     inputType: 'text' },
              description: { label: 'Mô tả',       inputType: 'textarea' },
              status:      { label: 'Trạng thái',  inputType: 'select',
                             options: ['Pending', 'Resolved', 'Cancelled'],
                             render: (v) => <Badge value={v} color={INCIDENT_COLOR[v] ?? '#94a3b8'} /> },
            }} />
        )}

        {currentPage === 'support' && <SupportChat />}
        {currentPage === 'report'  && <Report />}
        {currentPage === 'settings' && (
          <div className="page-section">
            <h1>Cài đặt</h1>
            <Settings onLogout={() => setCurrentPage('home')} />
          </div>
        )}

      </main>
    </div>
  )
}