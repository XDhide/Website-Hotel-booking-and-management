import {
  HomeOutlined,
  CreditCardOutlined,
  BellOutlined,
  MailOutlined,
  AppstoreOutlined,
  BugOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { ManagerPageKey } from "../../pages/ManagerPage";
import "../../assets/css/Adminpage/Sidebar.css";

interface SidebarProps {
  currentPage: ManagerPageKey;
  onNavigate: (page: ManagerPageKey) => void;
}

const navItems: {
  key: ManagerPageKey;
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: "home", label: "Trang chủ", icon: <HomeOutlined /> },
  { key: "room", label: "Phòng", icon: <AppstoreOutlined /> },
  { key: "bill", label: "Hóa đơn", icon: <CreditCardOutlined /> },
  { key: "serviceNotif", label: "Gọi dịch vụ", icon: <BellOutlined /> },
  { key: "lost", label: "Sự cố", icon: <BugOutlined /> },
  { key: "support", label: "Hỗ trợ", icon: <MailOutlined /> },
  { key: "settings", label: "Cài đặt", icon: <SettingOutlined /> },
];

export default function ManagerSidebar({
  currentPage,
  onNavigate,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-dot logo-dot-manager" />
        <span className="logo-text">Manager</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${currentPage === item.key ? "active" : ""}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {currentPage === item.key && <span className="nav-indicator" />}
          </button>
        ))}
      </nav>
    </aside>
  );
}
