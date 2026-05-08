import { useState } from "react";
import Sidebar from "../components/Adminpage/Sidebar";
import HomeAdmin from "../components/Adminpage/Homeadmin";
import SupportChat from "../components/Adminpage/SupportChat";
import Payment from "../components/Adminpage/Payment";
import Report from "../components/Adminpage/Report";
import Settings from "../components/Adminpage/Setting";
import ApiDataTable from "../components/Adminpage/DataTable";
import RoomTypeManager from "../components/Adminpage/RoomTypeManager";
import RoomRateManager from "../components/Adminpage/RoomRateManager";
import ServiceNotificationPanel from "../components/Adminpage/ServiceNotificationPanel";
import IncidentAdminTable from "../components/Adminpage/IncidentAdminTable";
import RoomAdminTable from "../components/Adminpage/RoomAdminTable";
import UserManager from "../components/Adminpage/UserManager";
import EvaluationManager from "../components/Adminpage/EvaluationManager";
import { isAdmin, isManager } from "../constant/api";
import "../assets/css/Adminpage/AdminPage.css";

export type PageKey =
  | "home"
  | "users"
  | "roomTypes"
  | "roomRates"
  | "support"
  | "settings"
  | "room"
  | "bill"
  | "serve"
  | "voucher"
  | "lost"
  | "report"
  | "serviceNotif"
  | "evaluation";

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v,
  );
const fmtD = (s: string) => {
  try {
    return new Date(s).toLocaleDateString("vi-VN");
  } catch {
    return s;
  }
};
const Badge = ({
  value,
  color = "#22c55e",
}: {
  value: string;
  color?: string;
}) => (
  <span
    className="admin-badge"
    style={{
      background: `${color}20`,
      color,
    }}
  >
    {value}
  </span>
);

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState<PageKey>("home");
  const adminMode = isAdmin();
  const managerMode = isManager();

  const adminOnlyPages: PageKey[] = [
    "users",
    "roomTypes",
    "roomRates",
    "serve",
    "voucher",
    "report",
    "evaluation",
  ];
  const safePage =
    managerMode && adminOnlyPages.includes(currentPage) ? "home" : currentPage;

  const navigate = (page: PageKey) => {
    if (managerMode && adminOnlyPages.includes(page)) return;
    setCurrentPage(page);
  };

  return (
    <div className="admin-layout">
      <Sidebar currentPage={safePage} onNavigate={navigate} />
      <main className="admin-content">
        {safePage === "home" && (
          <div className="page-section">
            <h1>Trang chủ</h1>
            <HomeAdmin />
          </div>
        )}

        {safePage === "users" && adminMode && <UserManager />}
        {safePage === "roomTypes" && adminMode && <RoomTypeManager />}
        {safePage === "roomRates" && adminMode && <RoomRateManager />}
        {safePage === "report" && adminMode && <Report />}
        {safePage === "evaluation" && adminMode && <EvaluationManager />}

        {safePage === "room" && (
          <RoomAdminTable canAdd={adminMode} canDelete={adminMode} />
        )}

        {safePage === "bill" && <Payment />}

        {safePage === "serve" && adminMode && (
          <ApiDataTable
            apiPrefix="services"
            pageSize={10}
            emptyForm={{ serviceType: "", name: "", price: 0, unit: "" }}
            fieldsMeta={{
              serviceType: { label: "Loại", inputType: "text" },
              name: { label: "Tên", inputType: "text" },
              price: {
                label: "Giá",
                inputType: "number",
                render: (v) => fmt(Number(v)),
              },
              unit: { label: "Đơn vị", inputType: "text" },
            }}
          />
        )}

        {safePage === "voucher" && adminMode && (
          <ApiDataTable
            apiPrefix="discount"
            pageSize={10}
            emptyForm={{
              name: "",
              discountType: "Percentage",
              discountValue: 0,
              fromDate: null,
              toDate: null,
              isActive: true,
            }}
            fieldsMeta={{
              name: { label: "Tên", inputType: "text" },
              discountType: {
                label: "Loại",
                inputType: "select",
                options: ["Percentage", "Fixed"],
                render: (v) => (
                  <Badge
                    value={v}
                    color={v === "Percentage" ? "#3b82f6" : "#8b5cf6"}
                  />
                ),
              },
              discountValue: {
                label: "Giá trị",
                inputType: "number",
                render: (v, row) =>
                  row.discountType === "Percentage" ? `${v}%` : fmt(Number(v)),
              },
              fromDate: {
                label: "Từ ngày",
                inputType: "date",
                render: (v) => (v ? fmtD(v) : "—"),
              },
              toDate: {
                label: "Đến ngày",
                inputType: "date",
                render: (v) => (v ? fmtD(v) : "—"),
              },
              isActive: {
                label: "Trạng thái",
                render: (v) => (
                  <Badge
                    value={v ? "Đang dùng" : "Tắt"}
                    color={v ? "#22c55e" : "#6b7280"}
                  />
                ),
              },
            }}
          />
        )}

        {safePage === "lost" && <IncidentAdminTable />}
        {safePage === "support" && <SupportChat />}
        {safePage === "serviceNotif" && <ServiceNotificationPanel />}

        {safePage === "settings" && (
          <div className="page-section">
            <h1>Cài đặt</h1>
            <Settings onLogout={() => setCurrentPage("home")} />
          </div>
        )}
      </main>
    </div>
  );
}
