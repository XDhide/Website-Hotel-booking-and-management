import { useState } from 'react'
import Sidebar from '../components/Adminpage/Sidebar'
import HomeAdmin from '../components/Adminpage/Homeadmin'
import SupportChat from '../components/Adminpage/SupportChat'
import Payment from '../components/Adminpage/Payment'
import Report from '../components/Adminpage/Report'
import Settings from '../components/Adminpage/Setting'
import ApiDataTable from '../components/Adminpage/DataTable'
import RoomTypeManager from '../components/Adminpage/RoomTypeManager'
import RoomRateManager from '../components/Adminpage/RoomRateManager'
import ServiceNotificationPanel from '../components/Adminpage/ServiceNotificationPanel'
import IncidentAdminTable from '../components/Adminpage/IncidentAdminTable'
import RoomAdminTable from '../components/Adminpage/RoomAdminTable'
import { API } from '../constant/config'
import '../assets/css/Adminpage/AdminPage.css'

export type PageKey =
  | 'home' | 'users' | 'roomTypes' | 'roomRates' | 'support' | 'settings'
  | 'room' | 'bill' | 'serve' | 'voucher' | 'lost' | 'report' | 'serviceNotif'

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

        {}
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

        {}
        {currentPage === 'roomTypes' && <RoomTypeManager />}

        {}
        {currentPage === 'roomRates' && <RoomRateManager />}

        {}
        {currentPage === 'room' && (
          <RoomAdminTable />
        )}

        {currentPage === 'bill' && <Payment />}

        {}
        {currentPage === 'serve' && (
          <ApiDataTable apiPrefix="services" pageSize={10}
            emptyForm={{ serviceType: '', name: '', price: 0, unit: '' }}
            fieldsMeta={{
              serviceType: { label: 'Loại',    inputType: 'text' },
              name:        { label: 'Tên',     inputType: 'text' },
              price:       { label: 'Giá',     inputType: 'number', render: (v) => fmt(Number(v)) },
              unit:        { label: 'Đơn vị', inputType: 'text' },
            }} />
        )}

        {}
        {currentPage === 'voucher' && (
          <ApiDataTable apiPrefix="discount" pageSize={10}
            emptyForm={{ name: '', discountType: 'Percentage', discountValue: 0, fromDate: null, toDate: null, isActive: true }}
            fieldsMeta={{
              name:          { label: 'Tên',       inputType: 'text' },
              discountType:  { label: 'Loại',      inputType: 'select', options: ['Percentage', 'Fixed'],
                               render: (v) => <Badge value={v} color={v === 'Percentage' ? '#3b82f6' : '#8b5cf6'} /> },
              discountValue: { label: 'Giá trị',   inputType: 'number',
                               render: (v, row) => row.discountType === 'Percentage' ? `${v}%` : fmt(Number(v)) },
              fromDate:      { label: 'Từ ngày',   inputType: 'date', render: (v) => v ? fmtD(v) : '—' },
              toDate:        { label: 'Đến ngày',  inputType: 'date', render: (v) => v ? fmtD(v) : '—' },
              isActive:      { label: 'Trạng thái',
                               render: (v) => <Badge value={v ? 'Đang dùng' : 'Tắt'} color={v ? '#22c55e' : '#6b7280'} /> },
            }} />
        )}

        {}
        {currentPage === 'lost' && (
          <IncidentAdminTable />
        )}

        {currentPage === 'support' && <SupportChat />}
        {currentPage === 'serviceNotif' && <ServiceNotificationPanel />}
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