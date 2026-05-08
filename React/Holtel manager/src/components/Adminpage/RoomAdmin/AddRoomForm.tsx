import "../../../assets/css/Adminpage/RoomAdmin.css";

interface RoomType {
  id: number;
  name: string;
}

interface FormState {
  roomNumber: string;
  roomTypeId: number;
  currentStatus: string;
}

const STATUS_LABEL: Record<string, string> = {
  Available: "Còn trống",
  Occupied: "Đang ở",
  Maintenance: "Bảo trì",
  Reserved: "Đã đặt",
};

interface Props {
  form: FormState;
  roomTypes: RoomType[];
  saving: boolean;
  error: string;
  onChange: (f: FormState) => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function AddRoomForm({
  form,
  roomTypes,
  saving,
  error,
  onChange,
  onCancel,
  onSave,
}: Props) {
  return (
    <div className="add-room-form">
      <h3>Thêm phòng mới</h3>
      <div className="add-room-form-grid">
        <div className="add-room-field">
          <label>Số phòng *</label>
          <input
            value={form.roomNumber}
            onChange={(e) => onChange({ ...form, roomNumber: e.target.value })}
            placeholder="VD: 101, A201..."
          />
        </div>
        <div className="add-room-field">
          <label>Loại phòng *</label>
          <select
            value={form.roomTypeId}
            onChange={(e) =>
              onChange({ ...form, roomTypeId: Number(e.target.value) })
            }
            style={form.roomTypeId ? {} : { color: "rgba(255,255,255,0.35)" }}
          >
            <option value={0}>-- Chọn loại phòng --</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name}
              </option>
            ))}
          </select>
        </div>
        <div className="add-room-field">
          <label>Trạng thái</label>
          <select
            value={form.currentStatus}
            onChange={(e) =>
              onChange({ ...form, currentStatus: e.target.value })
            }
          >
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <div className="add-room-error">{error}</div>}
      <div className="add-room-actions">
        <button onClick={onCancel} className="add-room-cancel-btn">
          Hủy
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="add-room-save-btn"
        >
          {saving ? "Đang lưu..." : "Thêm phòng"}
        </button>
      </div>
    </div>
  );
}
