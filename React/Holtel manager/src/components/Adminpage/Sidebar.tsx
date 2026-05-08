import {
  CreditCardOutlined,
  SnippetsOutlined,
  MailOutlined,
  BugOutlined,
  PieChartOutlined,
  HomeOutlined,
  SettingOutlined,
  TeamOutlined,
  AppstoreOutlined,
  TagsOutlined,
  BellOutlined,
  StarOutlined,
} from "@ant-design/icons";
import type { PageKey } from "../../pages/AdminPage.tsx";
import { isAdmin } from "../../constant/api";
import "../../assets/css/Adminpage/Sidebar.css";

interface SidebarProps {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
}

const managerItems: { key: PageKey; label: string; icon: React.ReactNode }[] = [
  { key: "home", label: "Trang chủ", icon: <HomeOutlined /> },
  { key: "room", label: "Phòng", icon: <AppstoreOutlined /> },
  { key: "bill", label: "Hóa đơn", icon: <CreditCardOutlined /> },
  { key: "serviceNotif", label: "Gọi dịch vụ", icon: <BellOutlined /> },
  { key: "lost", label: "Sự cố", icon: <BugOutlined /> },
  { key: "support", label: "Hỗ trợ", icon: <MailOutlined /> },
  { key: "settings", label: "Cài đặt", icon: <SettingOutlined /> },
];

const adminItems: { key: PageKey; label: string; icon: React.ReactNode }[] = [
  { key: "home", label: "Trang chủ", icon: <HomeOutlined /> },
  { key: "users", label: "Người dùng", icon: <TeamOutlined /> },
  { key: "roomTypes", label: "Loại phòng", icon: <AppstoreOutlined /> },
  { key: "roomRates", label: "Giá phòng", icon: <TagsOutlined /> },
  { key: "room", label: "Phòng", icon: <HomeOutlined /> },
  { key: "bill", label: "Hóa đơn", icon: <CreditCardOutlined /> },
  { key: "serve", label: "Dịch vụ", icon: <SnippetsOutlined /> },
  { key: "serviceNotif", label: "Gọi dịch vụ", icon: <BellOutlined /> },
  { key: "voucher", label: "Giảm giá", icon: <SnippetsOutlined /> },
  { key: "lost", label: "Sự cố", icon: <BugOutlined /> },
  { key: "evaluation", label: "Đánh giá", icon: <StarOutlined /> },
  { key: "report", label: "Báo cáo", icon: <PieChartOutlined /> },
  { key: "support", label: "Hỗ trợ", icon: <MailOutlined /> },
  { key: "settings", label: "Cài đặt", icon: <SettingOutlined /> },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const navItems = isAdmin() ? adminItems : managerItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-dot" />
        <span className="logo-text">{isAdmin() ? "Admin" : "Manager"}</span>
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
