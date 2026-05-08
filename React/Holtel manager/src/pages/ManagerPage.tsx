import { useState } from "react";
import ManagerSidebar from "../components/Managerpage/ManagerSidebar";
import HomeAdmin from "../components/Adminpage/Homeadmin";
import RoomAdminTable from "../components/Adminpage/RoomAdminTable";
import ServiceNotificationPanel from "../components/Adminpage/ServiceNotificationPanel";
import Payment from "../components/Adminpage/Payment";
import SupportChat from "../components/Adminpage/SupportChat";
import IncidentAdminTable from "../components/Adminpage/IncidentAdminTable";
import Settings from "../components/Adminpage/Setting";
import "../assets/css/Adminpage/AdminPage.css";

export type ManagerPageKey =
  | "home"
  | "room"
  | "serviceNotif"
  | "bill"
  | "support"
  | "lost"
  | "settings";

export default function ManagerPage() {
  const [currentPage, setCurrentPage] = useState<ManagerPageKey>("home");

  return (
    <div className="admin-layout">
      <ManagerSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="admin-content">
        {currentPage === "home" && (
          <div className="page-section">
            <h1>Trang chủ</h1>
            <HomeAdmin />
          </div>
        )}

        {currentPage === "room" && (
          <RoomAdminTable canAdd={false} canDelete={false} />
        )}

        {currentPage === "bill" && <Payment />}
        {currentPage === "serviceNotif" && <ServiceNotificationPanel />}
        {currentPage === "lost" && <IncidentAdminTable />}
        {currentPage === "support" && <SupportChat />}

        {currentPage === "settings" && (
          <div className="page-section">
            <h1>Cài đặt</h1>
            <Settings onLogout={() => setCurrentPage("home")} />
          </div>
        )}
      </main>
    </div>
  );
}
