// src/components/Footer.tsx  (hoặc src/layouts/Footer.tsx tùy cấu trúc dự án của bạn)
import "../assets/css/Footer.css";

export default function Footer() {
  const cols = [
    {
      title: "Dịch vụ",
      links: ["Đặt phòng", "Phòng Deluxe", "Phòng Suite", "Phòng gia đình", "Phòng tiêu chuẩn"],
    },
    {
      title: "Hỗ trợ",
      links: ["Câu hỏi thường gặp", "Chính sách hủy phòng", "Đồ thất lạc", "Liên hệ hỗ trợ"],
    },
    {
      title: "Về chúng tôi",
      links: ["Giới thiệu", "Đội ngũ", "Tuyển dụng", "Tin tức", "Điều khoản"],
    },
  ];

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand & Contact */}
          <div className="footer-brand">
            <div className="brand-name">
              <span>🏨</span> LuxStay
            </div>
            <p className="brand-desc">
              Hệ thống quản lý khách sạn hiện đại, mang đến trải nghiệm lưu trú đẳng cấp và tiện
              nghi tuyệt vời cho mọi khách hàng.
            </p>
            <div className="footer-contacts">
              <div className="contact-item"><span>📍</span> 123 Đường Lê Lợi, Quận 1, TP.HCM</div>
              <div className="contact-item"><span>📞</span> (028) 3822 1234</div>
              <div className="contact-item"><span>✉️</span> info@luxstay.vn</div>
              <div className="contact-item"><span>🕐</span> 24/7 Phục vụ</div>
            </div>
          </div>

          {/* Columns */}
          {cols.map((col) => (
            <div key={col.title} className="footer-column">
              <div className="column-title">{col.title}</div>
              <div className="column-links">
                {col.links.map((link) => (
                  <button key={link} className="column-link">
                    {link}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="copyright">© 2025 LuxStay. Bảo lưu mọi quyền.</div>
          <div className="social-icons">
            {["📘", "📸", "🐦", "▶️"].map((icon, i) => (
              <button key={i} className="social-btn">
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}