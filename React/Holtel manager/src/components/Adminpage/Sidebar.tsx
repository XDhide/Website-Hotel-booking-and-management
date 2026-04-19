import {CreditCardOutlined,SnippetsOutlined,WarningOutlined,MailOutlined,BugOutlined, PieChartOutlined,HomeOutlined, SettingOutlined, TeamOutlined, AppstoreOutlined } from '@ant-design/icons'
import type { PageKey } from '../../pages/AdminPage.tsx'
import '../../assets/css/Adminpage/Sidebar.css'

interface SidebarProps {
  currentPage: PageKey
  onNavigate: (page: PageKey) => void
}

const navItems: { key: PageKey; label: string; icon: React.ReactNode }[] = [
  { key: 'home',      label: 'Trang chủ',  icon: <HomeOutlined />      },
  { key: 'users',     label: 'Người dùng', icon: <TeamOutlined />      },
  { key: 'roomTypes', label: 'Loại phòng', icon: <AppstoreOutlined />  },
  { key: 'room',  label: 'Phòng',    icon: <HomeOutlined />   },
  { key: 'bill',  label: 'Hóa đơn',    icon: <CreditCardOutlined />   },
  { key: 'serve',  label: 'Dịch vụ',    icon: <SnippetsOutlined />   },
  { key: 'voucher',  label: 'Giảm giá',    icon: <SnippetsOutlined />   },
  { key: 'lost',  label: 'Thất lạc',    icon: <WarningOutlined />   },
  { key: 'incident',  label: 'Sự cố',    icon: <BugOutlined />   },
  { key: 'report',  label: 'Báo cáo',    icon: <PieChartOutlined />   },
  { key: 'support',   label: 'Hỗ trợ',    icon: <MailOutlined />      },
  { key: 'settings',  label: 'Cài đặt',    icon: <SettingOutlined />   },
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