import { HomeOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons'
import type { PageKey } from '../../pages/AdminPage'
import './Sidebar.css'

interface SidebarProps {
  currentPage: PageKey
  onNavigate: (page: PageKey) => void
}

const navItems: { key: PageKey; label: string; icon: React.ReactNode }[] = [
  { key: 'home',     label: 'Trang chủ', icon: <HomeOutlined />    },
  { key: 'profile',  label: 'Cá nhân',   icon: <UserOutlined />    },
  { key: 'settings', label: 'Cài đặt',   icon: <SettingOutlined /> },
]

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-dot" />
        <span className="logo-text">Admin</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.key}
            className={`nav-item ${currentPage === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {currentPage === item.key && <span className="nav-indicator" />}
          </button>
        ))}
      </nav>
    </aside>
  )
}
