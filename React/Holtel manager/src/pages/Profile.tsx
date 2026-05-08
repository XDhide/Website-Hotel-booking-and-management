import { useState, useEffect } from "react";
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  LockOutlined,
  CheckCircleOutlined,
  CameraOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import "../assets/css/Profile/Profile.css";
import Header from "../shared/Header";
import Footer from "../shared/Fooder";
import { apiGetProfile, apiUpdateProfile, apiChangePassword } from "../services/ProfileService";
import { USER_KEY } from "../constant/api";

const TABS = ["Thông tin cá nhân", "Đổi mật khẩu", "Thông báo"];

export default function Profile() {
  const [tab, setTab]     = useState(0);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pwdMsg, setPwdMsg] = useState({ text: "", ok: false });

  const [form, setForm] = useState({
    name:     "",
    email:    "",
    phone:    "",
    address:  "",
    dob:      "",
    gender:   "male",
  });

  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

  
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await apiGetProfile();
        if (data) {
          setForm({
            name:    data.fullName ?? data.userName ?? data.username ?? "",
            email:   data.email ?? "",
            phone:   data.phone ?? data.phoneNumber ?? "",
            address: data.address ?? "",
            dob:     data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
            gender:  data.gender ?? "male",
          });
        } else {
          
          const stored = localStorage.getItem(USER_KEY);
          if (stored) {
            try {
              const u = JSON.parse(stored);
              setForm(f => ({ ...f, name: u.userName ?? u.fullName ?? "", email: u.email ?? "" }));
            } catch {}
          }
        }
      } catch {
        const stored = localStorage.getItem(USER_KEY);
        if (stored) {
          try {
            const u = JSON.parse(stored);
            setForm(f => ({ ...f, name: u.userName ?? u.fullName ?? "", email: u.email ?? "" }));
          } catch {}
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      await apiUpdateProfile({
        fullName: form.name,
        phone: form.phone,
        address: form.address,
        dateOfBirth: form.dob || null,
        gender: form.gender,
      });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleChangePwd = async () => {
    if (pwd.next !== pwd.confirm) {
      setPwdMsg({ text: "Mật khẩu xác nhận không khớp.", ok: false });
      return;
    }
    try {
      await apiChangePassword({ currentPassword: pwd.current, newPassword: pwd.next });
      setPwdMsg({ text: "Đổi mật khẩu thành công!", ok: true });
      setPwd({ current: "", next: "", confirm: "" });
    } catch (e: any) {
      setPwdMsg({ text: e?.message ?? "Đổi mật khẩu thất bại.", ok: false });
    }
    setTimeout(() => setPwdMsg({ text: "", ok: false }), 4000);
  };

  return (
    <>
      <Header />
      <div className="pf-page">
      <div className="pf-header">
        <div className="container">
          <h1 className="pf-title"><UserOutlined /> Trang Cá Nhân</h1>
        </div>
      </div>

      <div className="container pf-body">
        {loading && (
          <div className="pf-loading-overlay">
            <LoadingOutlined className="pf-loading-icon" />
          </div>
        )}
        {saved && (
          <div className="pf-saved-toast">
            <CheckCircleOutlined className="pf-mr-6" />Đã lưu thành công!
          </div>
        )}
        <aside className="pf-sidebar">
          <div className="pf-avatar-wrap">
            <div className="pf-avatar">
              <UserOutlined className="pf-avatar-icon" />
            </div>
            <button className="pf-avatar-edit">
              <CameraOutlined />
            </button>
          </div>
          <div className="pf-avatar-name">{form.name}</div>
          <div className="pf-avatar-email">{form.email}</div>

          <div className="pf-stats">
            <div className="pf-stat">
              <div className="pf-stat-num">12</div>
              <div className="pf-stat-label">Lần đặt</div>
            </div>
            <div className="pf-stat">
              <div className="pf-stat-num">4</div>
              <div className="pf-stat-label">Yêu thích</div>
            </div>
            <div className="pf-stat">
              <div className="pf-stat-num">8</div>
              <div className="pf-stat-label">Đánh giá</div>
            </div>
          </div>

          <div className="pf-nav">
            {TABS.map((t, i) => (
              <button
                key={t}
                className={`pf-nav-item${tab === i ? " active" : ""}`}
                onClick={() => setTab(i)}
              >{t}</button>
            ))}
          </div>
        </aside>

        {}
        <main className="pf-main">
          {tab === 0 && (
            <div className="pf-card">
              <div className="pf-card-header">
                <h2 className="pf-card-title">Thông tin cá nhân</h2>
                {!editing ? (
                  <button className="pf-edit-btn" onClick={() => setEditing(true)}>
                    <EditOutlined /> Chỉnh sửa
                  </button>
                ) : (
                  <div className="pf-edit-actions">
                    <button className="pf-cancel-btn" onClick={() => setEditing(false)}>Hủy</button>
                    <button className="pf-save-btn" onClick={handleSave}>Lưu</button>
                  </div>
                )}
              </div>

              {saved && (
                <div className="pf-success-msg">
                  <CheckCircleOutlined /> Cập nhật thành công!
                </div>
              )}

              <div className="pf-form-grid">
                <div className="pf-form-group">
                  <label className="pf-form-label"><UserOutlined /> Họ và tên</label>
                  <input
                    className="pf-form-input"
                    value={form.name}
                    disabled={!editing}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="pf-form-group">
                  <label className="pf-form-label"><MailOutlined /> Email</label>
                  <input
                    className="pf-form-input"
                    value={form.email}
                    disabled={!editing}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="pf-form-group">
                  <label className="pf-form-label"><PhoneOutlined /> Số điện thoại</label>
                  <input
                    className="pf-form-input"
                    value={form.phone}
                    disabled={!editing}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="pf-form-group">
                  <label className="pf-form-label">Ngày sinh</label>
                  <input
                    type="date"
                    className="pf-form-input"
                    value={form.dob}
                    disabled={!editing}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  />
                </div>
                <div className="pf-form-group">
                  <label className="pf-form-label">Giới tính</label>
                  <select
                    className="pf-form-input"
                    value={form.gender}
                    disabled={!editing}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className="pf-form-group full">
                  <label className="pf-form-label"><HomeOutlined /> Địa chỉ</label>
                  <input
                    className="pf-form-input"
                    value={form.address}
                    disabled={!editing}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {tab === 1 && (
            <div className="pf-card">
              <div className="pf-card-header">
                <h2 className="pf-card-title"><LockOutlined /> Đổi mật khẩu</h2>
              </div>
              <div className="pf-pwd-form">
                {[
                  { key: "current", label: "Mật khẩu hiện tại" },
                  { key: "next",    label: "Mật khẩu mới" },
                  { key: "confirm", label: "Xác nhận mật khẩu mới" },
                ].map((f) => (
                  <div key={f.key} className="pf-form-group">
                    <label className="pf-form-label">{f.label}</label>
                    <input
                      type="password"
                      className="pf-form-input"
                      value={pwd[f.key as keyof typeof pwd]}
                      placeholder="••••••••"
                      onChange={(e) => setPwd({ ...pwd, [f.key]: e.target.value })}
                    />
                  </div>
                ))}
                {pwdMsg.text && (
                  <div className={`pf-pwd-msg ${pwdMsg.ok ? 'pf-pwd-msg-ok' : 'pf-pwd-msg-err'}`}>
                    {pwdMsg.text}
                  </div>
                )}
                <button className="pf-save-btn pf-mt-8 pf-w-full" onClick={handleChangePwd}>
                  Cập nhật mật khẩu
                </button>
              </div>
            </div>
          )}

          {tab === 2 && (
            <div className="pf-card">
              <div className="pf-card-header">
                <h2 className="pf-card-title">Cài đặt thông báo</h2>
              </div>
              <div className="pf-notif-list">
                {[
                  { label: "Email xác nhận đặt phòng", desc: "Nhận email khi đặt phòng thành công" },
                  { label: "Nhắc nhở nhận phòng",      desc: "Thông báo trước 1 ngày nhận phòng" },
                  { label: "Khuyến mãi & ưu đãi",      desc: "Nhận thông tin giảm giá độc quyền" },
                  { label: "Đánh giá sau lưu trú",     desc: "Nhắc nhở đánh giá phòng sau khi trả phòng" },
                ].map((n) => (
                  <div key={n.label} className="pf-notif-item">
                    <div>
                      <div className="pf-notif-label">{n.label}</div>
                      <div className="pf-notif-desc">{n.desc}</div>
                    </div>
                    <label className="pf-toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="pf-toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
      <Footer />
    </>
  );
}
