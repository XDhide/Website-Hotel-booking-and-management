import { useState } from 'react'
import Sidebar from '../components/Adminpage/Sidebar'
import DataTable from '../components/Adminpage/DataTable'
import RoomManager from '../components/Adminpage/RoomManager'
import SupportChat from '../components/Adminpage/SupportChat'
import Payment from '../components/Adminpage/Payment'
import Report from '../components/Adminpage/Report'
import './AdminPage.css'

export type PageKey =
  | 'home'
  | 'users'
  | 'roomTypes'
  | 'support'
  | 'settings'
  | 'room'
  | 'bill'
  | 'serve'
  | 'voucher'
  | 'lost'
  | 'incident'
  | 'report'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
}

interface RoomType {
  id: number
  typeName: string
  capacity: number
  pricePerNight: number
  bedType: string
  status: string
}

const USERS_DATA: User[] = [
  { id: 1, name: 'Nguyễn Văn An', email: 'an@example.com', role: 'Admin', status: 'Hoạt động' },
]

const ROOM_TYPES_DATA: RoomType[] = [
  { id: 1, typeName: 'Phòng Đơn', capacity: 1, pricePerNight: 500000, bedType: 'Single', status: 'Đang hoạt động' },
]

const StatusBadge = ({ value, activeLabel }: { value: string; activeLabel: string }) => (
  <span
    style={{
      padding: '2px 10px',
      borderRadius: '12px',
      fontSize: '0.8rem',
      fontWeight: 600,
      background: value === activeLabel ? '#dcfce7' : '#fee2e2',
      color: value === activeLabel ? '#16a34a' : '#dc2626',
    }}
  >
    {value}
  </span>
)

const formatVND = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState<PageKey>('home')

  return (
    <div className="admin-layout">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="admin-content">

        {currentPage === 'home' && (
          <div className="page-section">
            <h1>Trang chủ</h1>
            <RoomManager />
          </div>
        )}

        {currentPage === 'users' && (
          <DataTable<User>
            initialData={USERS_DATA}
            pageSize={5}
            emptyForm={{ name: '', email: '', role: 'Viewer', status: 'Hoạt động' }}
            fieldsMeta={{
              name: { label: 'Họ tên', inputType: 'text' },
              email: { label: 'Email', inputType: 'text' },
              role: {
                label: 'Vai trò',
                inputType: 'select',
                options: ['Admin', 'Editor', 'Viewer'],
              },
              status: {
                label: 'Trạng thái',
                inputType: 'select',
                options: ['Hoạt động', 'Không hoạt động'],
                render: (val) => <StatusBadge value={val} activeLabel="Hoạt động" />,
              },
            }}
          />
        )}

        {currentPage === 'roomTypes' && (
          <DataTable<RoomType>
            initialData={ROOM_TYPES_DATA}
            pageSize={5}
            emptyForm={{
              typeName: '',
              capacity: 1,
              pricePerNight: 0,
              bedType: 'Single',
              status: 'Đang hoạt động',
            }}
            fieldsMeta={{
              typeName: { label: 'Tên loại phòng', inputType: 'text' },
              capacity: { label: 'Sức chứa', inputType: 'number' },
              pricePerNight: {
                label: 'Giá',
                inputType: 'number',
                render: (val) => formatVND(Number(val)),
              },
              bedType: {
                label: 'Giường',
                inputType: 'select',
                options: ['Single', 'Double'],
              },
              status: {
                label: 'Trạng thái',
                inputType: 'select',
                options: ['Đang hoạt động', 'Không hoạt động'],
                render: (val) => <StatusBadge value={val} activeLabel="Đang hoạt động" />,
              },
            }}
          />
        )}

        {currentPage === 'bill' && (
          <Payment/>
        )}

        {currentPage === 'room' && (
          <DataTable<any>
            initialData={[]}
            pageSize={5}
            emptyForm={{ roomNumber: '', type: '', status: 'Trống' }}
            fieldsMeta={{
              roomNumber: { label: 'Số phòng', inputType: 'text' },
              type: { label: 'Loại phòng', inputType: 'text' },
              status: {
                label: 'Trạng thái',
                inputType: 'select',
                options: ['Trống', 'Đang sử dụng'],
                render: (val) => <StatusBadge value={val} activeLabel="Trống" />,
              },
            }}
          />
        )}

        {currentPage === 'serve' && (
          <DataTable<any>
            initialData={[]}
            pageSize={5}
            emptyForm={{ serviceName: '', price: 0, status: 'Đang hoạt động' }}
            fieldsMeta={{
              serviceName: { label: 'Tên dịch vụ', inputType: 'text' },
              price: {
                label: 'Giá',
                inputType: 'number',
                render: (val) => formatVND(Number(val)),
              },
              status: {
                label: 'Trạng thái',
                inputType: 'select',
                options: ['Đang hoạt động', 'Ngừng'],
                render: (val) => <StatusBadge value={val} activeLabel="Đang hoạt động" />,
              },
            }}
          />
        )}

        {currentPage === 'voucher' && (
          <DataTable<any>
            initialData={[]}
            pageSize={5}
            emptyForm={{ code: '', discount: 0, status: 'Còn hạn' }}
            fieldsMeta={{
              code: { label: 'Mã', inputType: 'text' },
              discount: { label: '% Giảm', inputType: 'number' },
              status: {
                label: 'Trạng thái',
                inputType: 'select',
                options: ['Còn hạn', 'Hết hạn'],
                render: (val) => <StatusBadge value={val} activeLabel="Còn hạn" />,
              },
            }}
          />
        )}

        {currentPage === 'lost' && (
          <DataTable<any>
            initialData={[]}
            pageSize={5}
            emptyForm={{ itemName: '', foundLocation: '', status: 'Chưa nhận' }}
            fieldsMeta={{
              itemName: { label: 'Tên đồ', inputType: 'text' },
              foundLocation: { label: 'Vị trí', inputType: 'text' },
              status: {
                label: 'Trạng thái',
                inputType: 'select',
                options: ['Chưa nhận', 'Đã trả'],
                render: (val) => <StatusBadge value={val} activeLabel="Đã trả" />,
              },
            }}
          />
        )}

        {currentPage === 'incident' && (
          <DataTable<any>
            initialData={[]}
            pageSize={5}
            emptyForm={{ title: '', description: '', status: 'Chưa xử lý' }}
            fieldsMeta={{
              title: { label: 'Tiêu đề', inputType: 'text' },
              description: { label: 'Mô tả', inputType: 'text' },
              status: {
                label: 'Trạng thái',
                inputType: 'select',
                options: ['Chưa xử lý', 'Hoàn thành'],
                render: (val) => <StatusBadge value={val} activeLabel="Hoàn thành" />,
              },
            }}
          />
        )}

        {currentPage === 'support' && (<SupportChat/>)}

        {currentPage === 'report' && (<Report/>)}

        {currentPage === 'settings' && <div>Settings Page</div>}

      </main>
    </div>
  )
}