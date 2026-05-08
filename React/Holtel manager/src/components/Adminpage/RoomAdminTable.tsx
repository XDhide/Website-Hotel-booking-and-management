import {
  apiGetAllRooms,
  apiCreateRoom,
  apiDeleteRoom,
  apiUpdateRoom,
} from "../../services/RoomService";
import { apiGetAllRoomTypes } from "../../services/RoomTypeService";
import { useState, useEffect, useCallback } from "react";
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import AddRoomForm from "./RoomAdmin/AddRoomForm";
import RoomRow, { type Room } from "./RoomAdmin/RoomRow";
import "../../assets/css/Adminpage/RoomAdmin.css";

interface RoomType {
  id: number;
  name: string;
}

interface Props {
  canAdd?: boolean;
  canDelete?: boolean;
}

export default function RoomAdminTable({
  canAdd = true,
  canDelete = true,
}: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [form, setForm] = useState({
    roomNumber: "",
    roomTypeId: 0,
    currentStatus: "Available",
  });

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGetAllRooms(1, 200);
      const raw = res.data;
      setRooms(Array.isArray(raw) ? raw : (raw?.data ?? []));
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRoomTypes = useCallback(async () => {
    try {
      const res = await apiGetAllRoomTypes(1, 100);
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
      setRoomTypes(
        list.map((rt: any) => ({ id: rt.id ?? rt.roomTypeId, name: rt.name })),
      );
    } catch {
      setRoomTypes([]);
    }
  }, []);

  useEffect(() => {
    loadRooms();
    loadRoomTypes();
  }, [loadRooms, loadRoomTypes]);

  const handleAdd = async () => {
    if (!form.roomNumber.trim()) {
      setError("Vui lòng nhập số phòng");
      return;
    }
    if (!form.roomTypeId) {
      setError("Vui lòng chọn loại phòng");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiCreateRoom(form);
      setShowAdd(false);
      setForm({ roomNumber: "", roomTypeId: 0, currentStatus: "Available" });
      await loadRooms();
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          e?.response?.data ??
          "Không thể thêm phòng",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa phòng này?")) return;
    try {
      await apiDeleteRoom(id);
      setRooms((prev) => prev.filter((r) => r.roomId !== id));
    } catch (e: any) {
      alert(e?.response?.data ?? "Không thể xóa");
    }
  };

  const handleSaveStatus = async (room: Room) => {
    try {
      await apiUpdateRoom(room.roomId, { ...room, currentStatus: editStatus });
      setRooms((prev) =>
        prev.map((r) =>
          r.roomId === room.roomId ? { ...r, currentStatus: editStatus } : r,
        ),
      );
      setEditId(null);
    } catch {
      alert("Không thể cập nhật");
    }
  };

  const filtered = rooms.filter((r) =>
    JSON.stringify(r).toLowerCase().includes(search.toLowerCase()),
  );

  const getRoomTypeName = (id: number) =>
    roomTypes.find((rt) => rt.id === id)?.name ?? `#${id}`;

  return (
    <div className="room-admin-wrap">
      <div className="room-admin-toolbar">
        <div>
          <h2 className="room-admin-title">Quản lý Phòng</h2>
          <p className="room-admin-subtitle">{rooms.length} phòng</p>
        </div>
        <div className="room-admin-actions">
          <button onClick={loadRooms} className="room-admin-reload-btn">
            <ReloadOutlined />
          </button>
          {canAdd && (
            <button
              onClick={() => {
                setShowAdd(true);
                setError("");
              }}
              className="room-admin-add-btn"
            >
              <PlusOutlined /> Thêm phòng
            </button>
          )}
        </div>
      </div>

      <div className="room-admin-search-wrap">
        <SearchOutlined className="room-admin-search-icon" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm số phòng, loại phòng, trạng thái..."
          className="room-admin-search-input"
        />
      </div>

      {showAdd && canAdd && (
        <AddRoomForm
          form={form}
          roomTypes={roomTypes}
          saving={saving}
          error={error}
          onChange={setForm}
          onCancel={() => {
            setShowAdd(false);
            setError("");
          }}
          onSave={handleAdd}
        />
      )}

      {loading ? (
        <div className="room-admin-loading">Đang tải...</div>
      ) : (
        <table className="room-admin-table">
          <thead>
            <tr>
              {["ID", "Số phòng", "Loại phòng", "Trạng thái", ""].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((room) => (
              <RoomRow
                key={room.roomId}
                room={room}
                roomTypeName={
                  room.roomTypeName ?? getRoomTypeName(room.roomTypeId)
                }
                isEditing={editId === room.roomId}
                editStatus={editStatus}
                canDelete={canDelete}
                onEdit={() => {
                  setEditId(room.roomId);
                  setEditStatus(room.currentStatus);
                }}
                onStatusChange={setEditStatus}
                onSave={() => handleSaveStatus(room)}
                onCancel={() => setEditId(null)}
                onDelete={() => handleDelete(room.roomId)}
              />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="room-admin-empty">
                  Chưa có phòng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
