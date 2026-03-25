import { useState } from 'react'
import Sidebar from '../components/HomePage/Sidebar'
import DataTable from '../components/HomePage/DataTable'
import './AdminPage.css'

export type PageKey = 'home' | 'profile' | 'settings'

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState<PageKey>('home')

  return (
    <div className="admin-layout">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="admin-content">
        {currentPage === 'home' && (
          <div className="page-section">
            <div className="page-header">
              <h1 className="page-title">Trang chủ</h1>
              <p className="page-subtitle">Quản lý danh sách người dùng trong hệ thống</p>
            </div>
            <DataTable />
          </div>
        )}
        {currentPage === 'profile' && (
          <div className="page-section">
            <div className="page-header">
              <h1 className="page-title">Cá nhân</h1>
              <p className="page-subtitle">Thông tin tài khoản của bạn</p>
            </div>
            <div className="placeholder-card">Nội dung trang cá nhân</div>
          </div>
        )}
        {currentPage === 'settings' && (
          <div className="page-section">
            <div className="page-header">
              <h1 className="page-title">Cài đặt</h1>
              <p className="page-subtitle">Tùy chỉnh ứng dụng</p>
            </div>
            <div className="placeholder-card">Nội dung trang cài đặt</div>
          </div>
        )}
      </main>
    </div>
  )
}
