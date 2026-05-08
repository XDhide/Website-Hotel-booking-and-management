import { useState, useEffect, useCallback } from "react";
import {
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { apiGetUserList } from "../../services/AccountService";
import { apiClient } from "../../constant/api";
import { API } from "../../constant/config";
import "../../assets/css/Adminpage/UserManager.css";

interface UserRow {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

const ROLES = ["Guest", "Manager", "Admin"];

const Badge = ({
  value,
  color = "#3b82f6",
}: {
  value: string;
  color?: string;
}) => (
  <span
    className="um-badge"
    style={{
      background: `${color}22`,
      color,
    }}
  >
    {value}
  </span>
);

const ROLE_COLORS: Record<string, string> = {
  Admin: "#ef4444",
  Manager: "#f97316",
  Staff: "#3b82f6",
  Guest: "#6b7280",
};

export default function UserManager() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const PAGE_SIZE = 10;

  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const load = useCallback(
    async (p = page) => {
      setLoading(true);
      setError("");
      try {
        const res = await apiGetUserList(p, PAGE_SIZE);
        const items = res?.data ?? [];
        setUsers(items);
        setTotalPages(res?.totalPages ?? 1);
        setTotalCount(res?.totalCount ?? items.length);
      } catch {
        setError("Không thể tải danh sách người dùng.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [page],
  );

  useEffect(() => {
    load(page);
  }, [page]);

  const filtered = search
    ? users.filter(
        (u) =>
          u.username?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase()),
      )
    : users;

  const openEdit = (u: UserRow) => {
    setEditUser(u);
    setSelectedRole(u.roles?.[0] ?? "Guest");
    setSaveMsg("");
  };

  const handleAssignRole = async () => {
    if (!editUser) return;
    setSaving(true);
    setSaveMsg("");
    try {
      await apiClient.post(`${API}/Account/assign-role`, {
        username: editUser.username,
        role: selectedRole,
      });
      setSaveMsg("✓ Cập nhật vai trò thành công!");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id ? { ...u, roles: [selectedRole] } : u,
        ),
      );
      setTimeout(() => setEditUser(null), 1200);
    } catch (e: any) {
      const msg = e?.response?.data;
      setSaveMsg("✗ " + (typeof msg === "string" ? msg : "Gán role thất bại."));
    } finally {
      setSaving(false);
    }
  };

  const pageNums = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => Math.max(1, Math.min(page - 2, totalPages - 4)) + i,
  ).filter((p) => p >= 1 && p <= totalPages);

  return (
    <div className="um-container">
      <div className="um-header">
        <div className="um-header-left">
          <UserOutlined className="um-header-icon" />
          <span className="um-header-title">Người dùng</span>
          <span className="um-count-badge">{totalCount} tài khoản</span>
        </div>
        <div className="um-header-right">
          <div className="um-search-box">
            <SearchOutlined className="um-search-icon" />
            <input
              className="um-search-input"
              placeholder="Tìm theo tên, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <button className="um-reload-btn" onClick={() => load(page)}>
            <ReloadOutlined />
          </button>
        </div>
      </div>

      {error && <div className="um-error-box">⚠ {error}</div>}

      <div className="um-table-wrap">
        <table className="um-table">
          <thead>
            <tr>
              {["#", "Tên đăng nhập", "Email", "Vai trò", "Thao tác"].map(
                (h) => (
                  <th key={h}>{h}</th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="um-loading-cell">
                  Đang tải...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="um-empty-cell">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filtered.map((u, i) => (
                <tr key={u.id}>
                  <td className="um-td-num">
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="um-td-user">
                    <div className="um-user-cell">
                      <div className="um-avatar">
                        <UserOutlined className="um-avatar-icon" />
                      </div>
                      <span className="um-username">{u.username}</span>
                    </div>
                  </td>
                  <td className="um-td-email">{u.email}</td>
                  <td className="um-td-roles">
                    {(u.roles ?? []).length === 0 ? (
                      <Badge value="Guest" color={ROLE_COLORS.Guest} />
                    ) : (
                      (u.roles ?? []).map((r) => (
                        <Badge
                          key={r}
                          value={r}
                          color={ROLE_COLORS[r] ?? "#3b82f6"}
                        />
                      ))
                    )}
                  </td>
                  <td className="um-td-actions">
                    <button className="um-edit-btn" onClick={() => openEdit(u)}>
                      <EditOutlined /> Phân quyền
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="um-pagination">
          <span className="um-pagination-info">
            Tổng {totalCount} tài khoản — Trang {page}/{totalPages}
          </span>
          <div className="um-pagination-btns">
            {[
              { label: "«", go: 1 },
              { label: "‹", go: page - 1 },
              ...pageNums.map((p) => ({ label: String(p), go: p })),
              { label: "›", go: page + 1 },
              { label: "»", go: totalPages },
            ].map(({ label, go }, idx) => (
              <button
                key={idx}
                className={`um-page-btn${String(go) === String(page) && !["«", "‹", "›", "»"].includes(label) ? " active" : ""}`}
                onClick={() => setPage(Math.max(1, Math.min(totalPages, go)))}
                disabled={
                  label === "«" || label === "‹"
                    ? page <= 1
                    : label === "›" || label === "»"
                      ? page >= totalPages
                      : false
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {editUser && (
        <div className="um-modal-overlay" onClick={() => setEditUser(null)}>
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <div className="um-modal-header">
              <h3 className="um-modal-title">Phân quyền tài khoản</h3>
              <button
                className="um-modal-close"
                onClick={() => setEditUser(null)}
              >
                <CloseOutlined />
              </button>
            </div>

            <div className="um-modal-user-label">Tài khoản</div>
            <div className="um-modal-user-row">
              <div className="um-modal-avatar">
                <UserOutlined className="um-avatar-icon-blue" />
              </div>
              <div>
                <div className="um-modal-username">{editUser.username}</div>
                <div className="um-modal-email">{editUser.email}</div>
              </div>
            </div>

            <div className="um-modal-role-label">Vai trò hiện tại</div>
            <div className="um-current-roles">
              {(editUser.roles ?? []).length === 0 ? (
                <Badge value="Guest" color={ROLE_COLORS.Guest} />
              ) : (
                (editUser.roles ?? []).map((r) => (
                  <Badge
                    key={r}
                    value={r}
                    color={ROLE_COLORS[r] ?? "#3b82f6"}
                  />
                ))
              )}
            </div>

            <div className="um-modal-role-label">Gán vai trò mới</div>
            <div className="um-role-grid">
              {ROLES.map((role) => (
                <button
                  key={role}
                  className={`um-role-btn ${selectedRole === role ? "active" : ""}`}
                  style={{
                    borderColor:
                      selectedRole === role
                        ? (ROLE_COLORS[role] ?? "#3b82f6")
                        : "rgba(255,255,255,0.1)",
                    background:
                      selectedRole === role
                        ? `${ROLE_COLORS[role] ?? "#3b82f6"}22`
                        : "rgba(255,255,255,0.03)",
                    color:
                      selectedRole === role
                        ? (ROLE_COLORS[role] ?? "#3b82f6")
                        : "rgba(255,255,255,0.6)",
                  }}
                  onClick={() => setSelectedRole(role)}
                >
                  {role}
                  {selectedRole === role && <CheckCircleOutlined />}
                </button>
              ))}
            </div>

            {saveMsg && (
              <div
                className={`um-save-msg ${saveMsg.startsWith("✓") ? "ok" : "err"}`}
              >
                {saveMsg}
              </div>
            )}

            <div className="um-modal-footer">
              <button
                className="um-btn-cancel"
                onClick={() => setEditUser(null)}
              >
                Huỷ
              </button>
              <button
                className="um-btn-save"
                onClick={handleAssignRole}
                disabled={saving}
              >
                {saving ? "Đang lưu..." : `Gán vai trò: ${selectedRole}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
