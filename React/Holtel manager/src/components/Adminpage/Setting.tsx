import { useState, useEffect } from 'react'
import {
  LogoutOutlined, UserOutlined, LockOutlined,
  BellOutlined, GlobalOutlined, InfoCircleOutlined,
  HomeOutlined
} from '@ant-design/icons'
import { clearAuth, getUser, isLoggedIn, apiClient } from '../../constant/api'
import { API } from '../../constant/config'
import { navigate } from '../../AppRouter'

interface SettingsProps {
  onLogout?: () => void
}

export default function Settings({ onLogout }: SettingsProps) {
  const user = getUser()
  const [activeSection, setActiveSection] = useState<string>('account')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [pwLoading, setPwLoading] = useState(false)

  const handleLogout = () => {
    clearAuth()
    setShowLogoutConfirm(false)
    if (onLogout) onLogout()
    // Chuyển về trang chủ
    navigate('/')
  }

  const handleChangePassword = async () => {
    if (!pwForm.newPassword || !pwForm.currentPassword) {
      setPwMsg({ text: 'Vui lòng nhập đầy đủ thông tin', ok: false }); return
    }
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwMsg({ text: 'Mật khẩu xác nhận không khớp', ok: false }); return
    }
    setPwLoading(true); setPwMsg(null)
    try {
      await apiClient.post(`${API}/Account/change-password`, {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      })
      setPwMsg({ text: 'Đổi mật khẩu thành công!', ok: true })
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (e: any) {
      setPwMsg({ text: e?.response?.data || 'Đổi mật khẩu thất bại', ok: false })
    } finally {
      setPwLoading(false)
    }
  }

  const sections = [
    { key: 'account', label: 'Tài khoản', icon: <UserOutlined /> },
    { key: 'password', label: 'Bảo mật', icon: <LockOutlined /> },
    { key: 'notify', label: 'Thông báo', icon: <BellOutlined /> },
    { key: 'system', label: 'Hệ thống', icon: <GlobalOutlined /> },
    { key: 'about', label: 'Thông tin', icon: <InfoCircleOutlined /> },
  ]

  return (
    <div style={{ display: 'flex', gap: 24, padding: '4px 0', minHeight: 500 }}>
      {/* Sidebar */}
      <div style={{
        width: 200, flexShrink: 0,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12, padding: '12px 8px', alignSelf: 'flex-start',
      }}>
        {sections.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              marginBottom: 4,
              background: activeSection === s.key ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: activeSection === s.key ? '#60a5fa' : 'rgba(255,255,255,0.6)',
              fontWeight: activeSection === s.key ? 600 : 400,
              fontSize: '0.88rem', textAlign: 'left', transition: 'all 0.15s',
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}

        <div style={{ margin: '12px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }} />

        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            marginBottom: 4, background: 'transparent',
            color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', textAlign: 'left',
          }}
        >
          <HomeOutlined /> Về trang chủ
        </button>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'rgba(239,68,68,0.08)',
            color: '#f87171', fontSize: '0.88rem', textAlign: 'left',
          }}
        >
          <LogoutOutlined /> Đăng xuất
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>

        {activeSection === 'account' && (
          <SettingCard title="Thông tin tài khoản">
            <InfoRow label="Tên đăng nhập" value={user?.userName ?? '—'} />
            <InfoRow label="Email" value={user?.email ?? '—'} />
            <InfoRow label="Vai trò" value="Admin / Manager" />
            <InfoRow label="Trạng thái" value="✅ Đang hoạt động" />
          </SettingCard>
        )}

        {activeSection === 'password' && (
          <SettingCard title="Đổi mật khẩu">
            {pwMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: '0.85rem',
                background: pwMsg.ok ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.1)',
                border: `1px solid ${pwMsg.ok ? 'rgba(34,197,94,0.3)' : 'rgba(220,38,38,0.3)'}`,
                color: pwMsg.ok ? '#4ade80' : '#f87171',
              }}>{pwMsg.text}</div>
            )}
            {(['currentPassword', 'newPassword', 'confirm'] as const).map((k) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {k === 'currentPassword' ? 'Mật khẩu hiện tại' : k === 'newPassword' ? 'Mật khẩu mới' : 'Xác nhận mật khẩu'}
                </label>
                <input
                  type="password"
                  value={pwForm[k]}
                  onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                    padding: '10px 14px', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
            <button
              onClick={handleChangePassword} disabled={pwLoading}
              style={{
                background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff',
                border: 'none', borderRadius: 8, padding: '10px 24px',
                cursor: pwLoading ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: pwLoading ? 0.6 : 1,
              }}
            >
              {pwLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
            </button>
          </SettingCard>
        )}

        {activeSection === 'notify' && (
          <SettingCard title="Cài đặt thông báo">
            {[
              ['Thông báo đặt phòng mới', true],
              ['Thông báo checkout', true],
              ['Cảnh báo sự cố', true],
              ['Thông báo tin nhắn hỗ trợ', false],
            ].map(([label, def]) => (
              <ToggleRow key={label as string} label={label as string} defaultOn={def as boolean} />
            ))}
          </SettingCard>
        )}

        {activeSection === 'system' && (
          <SettingCard title="Cài đặt hệ thống">
            <InfoRow label="Ngôn ngữ" value="Tiếng Việt" />
            <InfoRow label="Múi giờ" value="UTC+7 (Hà Nội)" />
            <InfoRow label="Đơn vị tiền tệ" value="VND (₫)" />
            <InfoRow label="Số bản ghi/trang" value="10" />
          </SettingCard>
        )}

        {activeSection === 'about' && (
          <SettingCard title="Thông tin hệ thống">
            <InfoRow label="Tên hệ thống" value="Hotel Manager" />
            <InfoRow label="Phiên bản" value="1.0.0" />
            <InfoRow label="Backend" value="ASP.NET Core Web API" />
            <InfoRow label="Frontend" value="React + TypeScript" />
            <InfoRow label="Liên hệ hỗ trợ" value="support@hotel.vn" />
          </SettingCard>
        )}
      </div>

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        }}>
          <div style={{
            background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: 32, width: 320, textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>👋</div>
            <h3 style={{ color: '#fff', margin: '0 0 8px' }}>Đăng xuất?</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: 24 }}>
              Bạn sẽ được chuyển về trang chủ.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  background: 'rgba(255,255,255,0.07)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                  padding: '10px 20px', cursor: 'pointer',
                }}
              >Huỷ</button>
              <button
                onClick={handleLogout}
                style={{
                  background: '#ef4444', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600,
                }}
              >Đăng xuất</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12, padding: '20px 24px',
    }}>
      <h3 style={{ color: '#fff', margin: '0 0 20px', fontSize: '1rem', fontWeight: 700 }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>{label}</span>
      <span style={{ color: '#fff', fontWeight: 500, fontSize: '0.88rem' }}>{value}</span>
    </div>
  )
}

function ToggleRow({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem' }}>{label}</span>
      <div
        onClick={() => setOn(v => !v)}
        style={{
          width: 44, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s',
          background: on ? '#3b82f6' : 'rgba(255,255,255,0.15)', position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: on ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s',
        }} />
      </div>
    </div>
  )
}