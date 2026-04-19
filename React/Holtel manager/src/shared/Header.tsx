import { useState, useRef, useEffect } from "react";
import { apiLogin, apiRegister, apiGetMe } from "../services/AccountService";
import { saveAuth, clearAuth, getUser, isLoggedIn, isAdmin } from "../constant/api";
import { navigate } from "../AppRouter";
import "../assets/css/Header.css";

type AuthMode = "login" | "register" | null;

export default function Header() {
  const [loggedIn, setLoggedIn]       = useState(isLoggedIn());
  const [user, setUser]               = useState(getUser());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authMode, setAuthMode]       = useState<AuthMode>(null);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [username, setUsername]       = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onLogin  = () => { setLoggedIn(true);  setUser(getUser()); };
    const onLogout = () => { setLoggedIn(false); setUser(null); setDropdownOpen(false); };
    window.addEventListener("auth:login",  onLogin);
    window.addEventListener("auth:logout", onLogout);
    return () => {
      window.removeEventListener("auth:login",  onLogin);
      window.removeEventListener("auth:logout", onLogout);
    };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
      if (modalRef.current && e.target === modalRef.current)
        closeModal();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const closeModal = () => {
    setAuthMode(null); setError("");
    setUsername(""); setEmail(""); setPassword("");
  };

  const handleLogin = async () => {
    if (!username || !password) { setError("Vui lòng nhập đầy đủ thông tin"); return; }
    setLoading(true); setError("");
    try {
      const res = await apiLogin({ username, password });
      if (res?.token) {
        // Lấy thêm thông tin role từ /me
        saveAuth(res.token, { userName: res.userName, email: res.email });
        try {
          // Decode JWT để lấy role
          const payload = JSON.parse(atob(res.token.split('.')[1]));
          const roleKey = Object.keys(payload).find(k => k.toLowerCase().includes('role'));
          const role = roleKey ? payload[roleKey] : '';
          saveAuth(res.token, { userName: res.userName, email: res.email }, 
            Array.isArray(role) ? role[0] : role);
        } catch {}
        closeModal();
      } else {
        setError("Đăng nhập thất bại");
      }
    } catch (err: any) {
      setError(err?.response?.data || "Sai tên đăng nhập hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !password) { setError("Vui lòng nhập đầy đủ thông tin"); return; }
    setLoading(true); setError("");
    try {
      const res = await apiRegister({ username, email, password });
      if (res?.token) {
        saveAuth(res.token, { userName: res.userName, email: res.email });
        closeModal();
      } else {
        setError("Đăng ký thất bại");
      }
    } catch (err: any) {
      const errs = err?.response?.data;
      if (Array.isArray(errs)) setError(errs.map((e: any) => e.description).join(", "));
      else setError(typeof errs === "string" ? errs : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth(); setDropdownOpen(false);
  };

  const goAdmin = () => {
    if (isAdmin()) navigate("/admin");
    else alert("Bạn không có quyền Admin/Manager");
    setDropdownOpen(false);
  };

  const navLinks = ["Phòng", "Yêu thích", "Đồ thất lạc", "Liên hệ"];

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <a href="/" className="logo"><span className="logo-text">HOTEL</span></a>

          <div className="search-box">
            <input type="text" className="search-input"
              placeholder="Tìm phòng, tiện nghi..."
              value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
          </div>

          <nav className="nav">
            {navLinks.map((link) => (
              <button key={link} className="nav-link">{link}</button>
            ))}

            {!loggedIn ? (
              <div className="auth-buttons">
                <button className="auth-btn register" onClick={() => setAuthMode("register")}>Đăng ký</button>
                <button className="auth-btn login"    onClick={() => setAuthMode("login")}>Đăng nhập</button>
              </div>
            ) : (
              <div className="avatar-wrapper" ref={dropdownRef}>
                <div className="user-avatar-text"
                  onClick={() => setDropdownOpen((p) => !p)} title={user?.userName}>
                  {user?.userName?.slice(0, 2).toUpperCase() || "U"}
                </div>

                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-name">{user?.userName}</div>
                      <div className="dropdown-room">{user?.email}</div>
                    </div>
                    {isAdmin() && (
                      <button className="dropdown-item" onClick={goAdmin}>
                        🛡 Trang Admin
                      </button>
                    )}
                    <button className="dropdown-item">Phòng đang đặt</button>
                    <button className="dropdown-item">Lịch sử giao dịch</button>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Auth Modal */}
      {authMode && (
        <div className="auth-modal-overlay" ref={modalRef}>
          <div className="auth-modal">
            <div className="auth-modal-header">
              <h2>{authMode === "login" ? "Đăng nhập" : "Đăng ký"}</h2>
              <button className="auth-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="auth-modal-body">
              {error && <div className="auth-error">{error}</div>}

              <div className="auth-field">
                <label>Tên đăng nhập</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  onKeyDown={e => e.key === "Enter" && (authMode === "login" ? handleLogin() : handleRegister())} />
              </div>

              {authMode === "register" && (
                <div className="auth-field">
                  <label>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Nhập email" />
                </div>
              )}

              <div className="auth-field">
                <label>Mật khẩu</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  onKeyDown={e => e.key === "Enter" && (authMode === "login" ? handleLogin() : handleRegister())} />
              </div>

              <button className="auth-submit-btn"
                onClick={authMode === "login" ? handleLogin : handleRegister}
                disabled={loading}>
                {loading ? "Đang xử lý..." : authMode === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>

              <div className="auth-switch">
                {authMode === "login" ? (
                  <>Chưa có tài khoản?{" "}
                    <button onClick={() => { setAuthMode("register"); setError(""); }}>Đăng ký ngay</button>
                  </>
                ) : (
                  <>Đã có tài khoản?{" "}
                    <button onClick={() => { setAuthMode("login"); setError(""); }}>Đăng nhập</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}