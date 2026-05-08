import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import "../../../assets/css/Adminpage/RoomAdmin.css";

export interface Room {
  roomId: number;
  roomNumber: string;
  roomTypeId: number;
  roomTypeName?: string;
  currentStatus: string;
}

const STATUS_COLOR: Record<string, string> = {
  Available: "#22c55e",
  Occupied: "#ef4444",
  Maintenance: "#f59e0b",
  Reserved: "#3b82f6",
};
const STATUS_LABEL: Record<string, string> = {
  Available: "Còn trống",
  Occupied: "Đang ở",
  Maintenance: "Bảo trì",
  Reserved: "Đã đặt",
};

interface Props {
  room: Room;
  roomTypeName: string;
  isEditing: boolean;
  editStatus: string;
  canDelete?: boolean;
  onEdit: () => void;
  onStatusChange: (s: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function RoomRow({
  room,
  roomTypeName,
  isEditing,
  editStatus,
  canDelete = true,
  onEdit,
  onStatusChange,
  onSave,
  onCancel,
  onDelete,
}: Props) {
  return (
    <tr className="room-row">
      <td className="room-id-cell">#{room.roomId}</td>
      <td>
        <span className="room-number-badge">{room.roomNumber}</span>
      </td>
      <td className="room-type-cell">{roomTypeName}</td>
      <td>
        {isEditing ? (
          <div className="room-status-edit-row">
            <select
              value={editStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="room-status-select"
              style={{
                border: `1px solid ${STATUS_COLOR[editStatus] ?? "#475569"}`,
                color: STATUS_COLOR[editStatus] ?? "#94a3b8",
              }}
            >
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <button onClick={onSave} className="room-save-btn">
              <CheckOutlined />
            </button>
            <button onClick={onCancel} className="room-cancel-btn">
              <CloseOutlined />
            </button>
          </div>
        ) : (
          <span
            className="room-status-badge"
            style={{
              background: `${STATUS_COLOR[room.currentStatus] ?? "#475569"}18`,
              border: `1px solid ${STATUS_COLOR[room.currentStatus] ?? "#475569"}40`,
              color: STATUS_COLOR[room.currentStatus] ?? "#94a3b8",
            }}
          >
            <span
              className="room-status-dot"
              style={{
                background: STATUS_COLOR[room.currentStatus] ?? "#94a3b8",
              }}
            />
            {STATUS_LABEL[room.currentStatus] ?? room.currentStatus}
          </span>
        )}
      </td>
      <td className="room-td-actions">
        <div className="room-row-actions">
          <button onClick={onEdit} className="room-edit-btn">
            <EditOutlined />
          </button>
          {canDelete && (
            <button onClick={onDelete} className="room-delete-btn">
              <DeleteOutlined />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
