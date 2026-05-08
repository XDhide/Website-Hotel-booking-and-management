import { apiChangePassword } from "../../services/ProfileService";
import { useState } from "react";
import {
  LogoutOutlined,
  UserOutlined,
  LockOutlined,
  BellOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { clearAuth, getUser } from "../../constant/api";
import { navigate } from "../../Approuter";
import "../../assets/css/Adminpage/Setting.css";

interface SettingsProps {
  onLogout?: () => void;
}

export default function Settings({ onLogout }: SettingsProps) {
  const user = getUser();
  const [activeSection, setActiveSection] = useState<string>("account");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(
    null,
  );
  const [pwLoading, setPwLoading] = useState(false);

  const handleLogout = () => {
    clearAuth();
    setShowLogoutConfirm(false);
    if (onLogout) onLogout();
    navigate("/");
  };

  const handleChangePassword = async () => {
    if (!pwForm.newPassword || !pwForm.currentPassword) {
      setPwMsg({ text: "Vui lòng nhập đầy đủ thông tin", ok: false });
      return;
    }
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwMsg({ text: "Mật khẩu xác nhận không khớp", ok: false });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      await apiChangePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ text: "Đổi mật khẩu thành công!", ok: true });
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (e: any) {
      setPwMsg({
        text: e?.response?.data || "Đổi mật khẩu thất bại",
        ok: false,
      });
    } finally {
      setPwLoading(false);
    }
  };

  const sections = [
    { key: "account", label: "Tài khoản", icon: <UserOutlined /> },
    { key: "password", label: "Bảo mật", icon: <LockOutlined /> },
    { key: "notify", label: "Thông báo", icon: <BellOutlined /> },
    { key: "system", label: "Hệ thống", icon: <GlobalOutlined /> },
    { key: "about", label: "Thông tin", icon: <InfoCircleOutlined /> },
  ];

  return (
    <div className="setting-layout">
      <div className="setting-sidenav">
        {sections.map((s) => (
          <button
            key={s.key}
            className={`setting-nav-btn${activeSection === s.key ? " active" : ""}`}
            onClick={() => setActiveSection(s.key)}
          >
            {s.icon} {s.label}
          </button>
        ))}

        <div className="setting-nav-divider" />

        <button className="setting-nav-btn-home" onClick={() => navigate("/")}>
          <HomeOutlined /> Về trang chủ
        </button>

        <button
          className="setting-nav-btn-logout"
          onClick={() => setShowLogoutConfirm(true)}
        >
          <LogoutOutlined /> Đăng xuất
        </button>
      </div>

      <div className="setting-content">
        {activeSection === "account" && (
          <SettingCard title="Thông tin tài khoản">
            <InfoRow label="Tên đăng nhập" value={user?.userName ?? "—"} />
            <InfoRow label="Email" value={user?.email ?? "—"} />
            <InfoRow label="Vai trò" value="Admin / Manager" />
            <InfoRow label="Trạng thái" value="Đang hoạt động" />
          </SettingCard>
        )}

        {activeSection === "password" && (
          <SettingCard title="Đổi mật khẩu">
            {pwMsg && (
              <div className={`setting-pw-msg ${pwMsg.ok ? "ok" : "err"}`}>
                {pwMsg.text}
              </div>
            )}
            {(["currentPassword", "newPassword", "confirm"] as const).map(
              (k) => (
                <div key={k} className="setting-pw-field">
                  <label className="setting-pw-label">
                    {k === "currentPassword"
                      ? "Mật khẩu hiện tại"
                      : k === "newPassword"
                        ? "Mật khẩu mới"
                        : "Xác nhận mật khẩu"}
                  </label>
                  <input
                    type="password"
                    className="setting-pw-input"
                    value={pwForm[k]}
                    onChange={(e) =>
                      setPwForm((f) => ({ ...f, [k]: e.target.value }))
                    }
                  />
                </div>
              ),
            )}
            <button
              className="setting-pw-btn"
              onClick={handleChangePassword}
              disabled={pwLoading}
            >
              {pwLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </button>
          </SettingCard>
        )}

        {activeSection === "notify" && (
          <SettingCard title="Cài đặt thông báo">
            {[
              ["Thông báo đặt phòng mới", true],
              ["Thông báo checkout", true],
              ["Cảnh báo sự cố", true],
              ["Thông báo tin nhắn hỗ trợ", false],
            ].map(([label, def]) => (
              <ToggleRow
                key={label as string}
                label={label as string}
                defaultOn={def as boolean}
              />
            ))}
          </SettingCard>
        )}

        {activeSection === "system" && (
          <SettingCard title="Cài đặt hệ thống">
            <InfoRow label="Ngôn ngữ" value="Tiếng Việt" />
            <InfoRow label="Múi giờ" value="UTC+7 (Hà Nội)" />
            <InfoRow label="Đơn vị tiền tệ" value="VND (₫)" />
            <InfoRow label="Số bản ghi/trang" value="10" />
          </SettingCard>
        )}

        {activeSection === "about" && (
          <SettingCard title="Thông tin hệ thống">
            <InfoRow label="Tên hệ thống" value="Hotel Manager" />
            <InfoRow label="Phiên bản" value="1.0.0" />
            <InfoRow label="Backend" value="ASP.NET Core Web API" />
            <InfoRow label="Frontend" value="React + TypeScript" />
            <InfoRow label="Liên hệ hỗ trợ" value="support@hotel.vn" />
          </SettingCard>
        )}
      </div>

      {showLogoutConfirm && (
        <div className="setting-logout-overlay">
          <div className="setting-logout-modal">
            <div className="setting-logout-icon">
              <LogoutOutlined />
            </div>
            <h3 className="setting-logout-title">Đăng xuất?</h3>
            <p className="setting-logout-desc">
              Bạn sẽ được chuyển về trang chủ.
            </p>
            <div className="setting-logout-actions">
              <button
                className="setting-logout-btn-cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Huỷ
              </button>
              <button
                className="setting-logout-btn-confirm"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="setting-card">
      <h3 className="setting-card-title">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="setting-info-row">
      <span className="setting-info-label">{label}</span>
      <span className="setting-info-value">{value}</span>
    </div>
  );
}

function ToggleRow({
  label,
  defaultOn,
}: {
  label: string;
  defaultOn: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="setting-toggle-row">
      <span className="setting-toggle-label">{label}</span>
      <div
        className={`setting-toggle-track ${on ? "on" : "off"}`}
        onClick={() => setOn((v) => !v)}
      >
        <div className={`setting-toggle-thumb ${on ? "on" : "off"}`} />
      </div>
    </div>
  );
}
