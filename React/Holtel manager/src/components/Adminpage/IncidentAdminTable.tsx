import {
  apiGetAllLostItems,
  apiReportLostItem,
  apiUpdateLostItem,
  apiDeleteLostItem,
} from "../../services/LostItemService";
import { apiGetAllRooms } from "../../services/RoomService";
import { useState, useEffect, useCallback } from "react";
import {
  BugOutlined,
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  LoadingOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import "../../assets/css/Adminpage/IncidentAdminTable.css";

interface Room {
  roomId: number;
  roomNumber: string;
  roomTypeId: number;
}
interface RoomInUse {
  roomUseId: number;
  roomId: number;
  status: string;
  bookingId?: number;
}
interface Incident {
  lostItemId: number;
  roomId?: number;
  roomUseId?: number;
  itemName: string;
  description?: string;
  status: string;
  foundAt?: string;
  createdAt?: string;
  roomNumber?: string;
}

const fmt = (s?: string) => {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
};

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  Pending: { label: "Chờ xử lý", color: "#f59e0b" },
  Lost: { label: "Thất lạc", color: "#ef4444" },
  Found: { label: "Đã tìm thấy", color: "#22c55e" },
  Returned: { label: "Đã trả lại", color: "#3b82f6" },
  Resolved: { label: "Đã xử lý", color: "#22c55e" },
};

const EMPTY_FORM = {
  roomId: 0,
  roomUseId: 0,
  itemName: "",
  description: "",
  status: "Pending",
  foundAt: "",
};

export default function IncidentAdminTable() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomInUses, setRoomInUses] = useState<RoomInUse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Incident | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [incRes, roomRes, riRes] = await Promise.all([
        apiGetAllLostItems(1, 100).then((r) => ({ data: r })),
        apiGetAllRooms(1, 200).then((r) => ({ data: r })),
        Promise.resolve({ data: { data: [] } }),
      ]);
      const incList = incRes.data?.data ?? incRes.data ?? [];
      setIncidents(Array.isArray(incList) ? incList : []);
      const roomList = roomRes.data?.data ?? roomRes.data ?? [];
      setRooms(Array.isArray(roomList) ? roomList : []);
      const riList = riRes.data?.data ?? riRes.data ?? [];
      setRoomInUses(Array.isArray(riList) ? riList : []);
    } catch {
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditItem(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setShowForm(true);
  };

  const openEdit = (item: Incident) => {
    setEditItem(item);
    setForm({
      roomId: item.roomId ?? 0,
      roomUseId: item.roomUseId ?? 0,
      itemName: item.itemName ?? "",
      description: item.description ?? "",
      status: item.status ?? "Pending",
      foundAt: item.foundAt ? item.foundAt.split("T")[0] : "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.itemName.trim()) {
      setError("Vui lòng nhập tên / tiêu đề sự cố");
      return;
    }
    if (!form.roomId) {
      setError("Vui lòng chọn phòng");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        roomId: form.roomId,
        roomUseId: form.roomUseId,
        itemName: form.itemName,
        description: form.description,
        status: form.status,
        foundAt: form.foundAt ? new Date(form.foundAt).toISOString() : null,
      };
      if (editItem) {
        await apiUpdateLostItem(editItem.lostItemId, payload);
      } else {
        await apiReportLostItem(payload);
      }
      setShowForm(false);
      await load();
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          e?.response?.data ??
          e?.message ??
          "Lỗi lưu dữ liệu",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa sự cố này?")) return;
    try {
      await apiDeleteLostItem(id);
      setIncidents((prev) => prev.filter((i) => i.lostItemId !== id));
    } catch (e: any) {
      alert(e?.response?.data ?? "Không thể xóa");
    }
  };

  const riForRoom = roomInUses.filter((r) => r.roomId === Number(form.roomId));

  return (
    <div className="incident-wrapper">
      <div className="incident-header">
        <div className="incident-header-left">
          <h2>
            <BugOutlined /> Quản lý Sự cố
          </h2>
          <p>Báo cáo sự cố và đồ thất lạc từ các phòng</p>
        </div>
        <div className="incident-header-actions">
          <button className="incident-btn-reload" onClick={load}>
            <ReloadOutlined />
          </button>
          <button className="incident-btn-add" onClick={openAdd}>
            <PlusOutlined /> Thêm sự cố
          </button>
        </div>
      </div>

      {loading ? (
        <div className="incident-loading">
          <LoadingOutlined />
        </div>
      ) : (
        <div className="incident-table-wrap">
          <table className="incident-table">
            <thead>
              <tr>
                {[
                  "#",
                  "Phòng",
                  "Tiêu đề / Tên vật",
                  "Mô tả",
                  "Trạng thái",
                  "Ngày tạo",
                  "Thao tác",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="incident-empty-cell">
                    Chưa có sự cố nào
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => {
                  const stCfg = STATUS_CFG[inc.status] ?? {
                    label: inc.status,
                    color: "#94a3b8",
                  };
                  return (
                    <tr key={inc.lostItemId}>
                      <td className="incident-td-id">#{inc.lostItemId}</td>
                      <td className="incident-td-room">
                        <HomeOutlined className="incident-room-icon" />
                        {inc.roomNumber
                          ? `Phòng ${inc.roomNumber}`
                          : inc.roomId
                            ? `ID ${inc.roomId}`
                            : "—"}
                      </td>
                      <td className="incident-td-title">{inc.itemName}</td>
                      <td className="incident-td-desc">
                        <span className="incident-desc-clamp">
                          {inc.description || "—"}
                        </span>
                      </td>
                      <td className="incident-td-status">
                        <span
                          className="incident-status-badge"
                          style={{
                            background: stCfg.color + "22",
                            color: stCfg.color,
                            border: `1px solid ${stCfg.color}44`,
                          }}
                        >
                          {inc.status === "Resolved" ||
                          inc.status === "Found" ||
                          inc.status === "Returned" ? (
                            <CheckCircleOutlined />
                          ) : (
                            <ClockCircleOutlined />
                          )}
                          {stCfg.label}
                        </span>
                      </td>
                      <td className="incident-td-date">{fmt(inc.createdAt)}</td>
                      <td className="incident-td-actions">
                        <div className="incident-actions-row">
                          <button
                            className="incident-btn-edit"
                            onClick={() => openEdit(inc)}
                          >
                            <EditOutlined />
                          </button>
                          <button
                            className="incident-btn-delete"
                            onClick={() => handleDelete(inc.lostItemId)}
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div
          className="incident-modal-overlay"
          onClick={() => setShowForm(false)}
        >
          <div className="incident-modal" onClick={(e) => e.stopPropagation()}>
            <div className="incident-modal-header">
              <span className="incident-modal-header-title">
                <BugOutlined className="incident-modal-header-icon" />
                {editItem ? "Chỉnh sửa sự cố" : "Thêm sự cố mới"}
              </span>
              <button
                className="incident-modal-close"
                onClick={() => setShowForm(false)}
              >
                <CloseOutlined />
              </button>
            </div>

            <div className="incident-modal-body">
              <div>
                <label className="incident-field-label">Phòng *</label>
                <select
                  className="incident-field-select"
                  value={form.roomId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      roomId: Number(e.target.value),
                      roomUseId: 0,
                    }))
                  }
                >
                  <option value={0}>-- Chọn phòng --</option>
                  {rooms.map((r) => (
                    <option key={r.roomId} value={r.roomId}>
                      Phòng {r.roomNumber}
                    </option>
                  ))}
                </select>
              </div>

              {riForRoom.length > 0 && (
                <div>
                  <label className="incident-field-label">
                    Lượt lưu trú (tuỳ chọn)
                  </label>
                  <select
                    className="incident-field-select"
                    value={form.roomUseId}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        roomUseId: Number(e.target.value),
                      }))
                    }
                  >
                    <option value={0}>-- Không chọn --</option>
                    {riForRoom.map((r) => (
                      <option key={r.roomUseId} value={r.roomUseId}>
                        Lượt #{r.roomUseId} — {r.status}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="incident-field-label">
                  Tên / Tiêu đề sự cố *
                </label>
                <input
                  type="text"
                  className="incident-field-input"
                  value={form.itemName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, itemName: e.target.value }))
                  }
                  placeholder="VD: Điều hòa hỏng, Đồ thất lạc..."
                />
              </div>

              <div>
                <label className="incident-field-label">Mô tả chi tiết</label>
                <textarea
                  className="incident-field-textarea"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Mô tả chi tiết sự cố hoặc đồ thất lạc..."
                  rows={4}
                />
              </div>

              <div>
                <label className="incident-field-label">
                  Ngày tìm thấy / giải quyết (tuỳ chọn)
                </label>
                <input
                  type="date"
                  className="incident-field-input"
                  value={form.foundAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, foundAt: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="incident-field-label">Trạng thái</label>
                <select
                  className="incident-field-select"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  <option value="Pending">Chờ xử lý</option>
                  <option value="Lost">Thất lạc</option>
                  <option value="Found">Đã tìm thấy</option>
                  <option value="Returned">Đã trả lại</option>
                  <option value="Resolved">Đã xử lý</option>
                </select>
              </div>

              {error && <div className="incident-error-box">{error}</div>}
            </div>

            <div className="incident-modal-footer">
              <button
                className="incident-btn-cancel"
                onClick={() => setShowForm(false)}
              >
                Hủy
              </button>
              <button
                className="incident-btn-save"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <LoadingOutlined className="incident-loading-icon-small" />
                    Đang lưu...
                  </>
                ) : editItem ? (
                  "Cập nhật"
                ) : (
                  "Thêm sự cố"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
