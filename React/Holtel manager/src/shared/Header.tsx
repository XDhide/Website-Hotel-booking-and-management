import { useState, useRef, useEffect } from "react";
import "../assets/css/Header.css";

interface User {
  name: string;
  avatar: string;
  room: string;
}

const mockUser: User = {
  name: "Nguyễn Văn An",
  avatar: "https://i.pravatar.cc/40?img=3",
  room: "Phòng 203 - Deluxe",
};

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { label: "Phòng" },
    { label: "Yêu thích" },
    { label: "Đồ thất lạc"},
    { label: "Liên hệ" },
  ];

  const dropdownItems = [
    {  label: "Phòng đang đặt" },
    {  label: "Lịch sử giao dịch" },
    {  label: "Trang cá nhân" },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        <a href="#" className="logo">
          <span className="logo-text">HEHEHE</span>
        </a>

        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Tìm phòng, tiện nghi..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <nav className="nav">
          {navLinks.map((link) => (
            <button key={link.label} className="nav-link">
              {link.label}
            </button>
          ))}

          {!isLoggedIn ? (
            <div className="auth-buttons">
              <button className="auth-btn register">Đăng ký</button>
              <button
                className="auth-btn login"
                onClick={() => setIsLoggedIn(true)}
              >
                Đăng nhập
              </button>
            </div>
          ) : (
            <div className="avatar-wrapper" ref={dropdownRef}>
              <img
                src={mockUser.avatar}
                alt="User avatar"
                className="user-avatar"
                onClick={() => setDropdownOpen((prev) => !prev)}
              />

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-name">{mockUser.name}</div>
                    <div className="dropdown-room">{mockUser.room}</div>
                  </div>

                  {dropdownItems.map((item) => (
                    <button key={item.label} className="dropdown-item">
                      {item.label}
                    </button>
                  ))}

                  <button
                    className="dropdown-item logout"
                    onClick={() => {
                      setIsLoggedIn(false);
                      setDropdownOpen(false);
                    }}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}