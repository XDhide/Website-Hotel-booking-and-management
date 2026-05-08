import {
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import "../../../assets/css/Adminpage/HomeAdmin.css";

interface Props {
  pendingCount: number;
  activeCount: number;
  unpaidCount: number;
  onCreateBooking: () => void;
}

export default function StatsBar({
  pendingCount,
  activeCount,
  unpaidCount,
  onCreateBooking,
}: Props) {
  return (
    <div className="stats-bar">
      {[
        {
          label: "Booking chờ xác nhận",
          val: pendingCount,
          color: "#f59e0b",
          icon: <ClockCircleOutlined />,
        },
        {
          label: "Đang ở",
          val: activeCount,
          color: "#22c55e",
          icon: <CheckCircleOutlined />,
        },
        {
          label: "Hoá đơn chưa TT",
          val: unpaidCount,
          color: "#ef4444",
          icon: <FileTextOutlined />,
        },
      ].map((s) => (
        <div
          key={s.label}
          className="stats-card"
          style={{ border: `1px solid ${s.color}33` }}
        >
          <div className="stats-card-value" style={{ color: s.color }}>
            {s.val}
          </div>
          <div className="stats-card-label">
            {s.icon} {s.label}
          </div>
        </div>
      ))}
      <button onClick={onCreateBooking} className="stats-create-btn">
        <PlusOutlined /> Tạo Booking mới
      </button>
    </div>
  );
}
