// src/components/Comments/Comments.tsx
import { StarFilled, CommentOutlined } from "@ant-design/icons";
import { COMMENTS } from "./rooms";
import "./Comments.css";

export default function Comments() {
  return (
    <section className="section cmt-section">
      <div className="container">
        <h2 className="section-title">
          <CommentOutlined className="section-title-icon" />
          Đánh Giá Của Khách Hàng
        </h2>
        <p className="section-subtitle">
          Những trải nghiệm thực tế từ khách hàng của chúng tôi
        </p>

        <div className="cmt-grid">
          {COMMENTS.map((c) => (
            <div key={c.id} className="cmt-card">
              <div className="cmt-header">
                <img src={c.avatar} alt={c.name} className="cmt-avatar" />
                <div className="cmt-meta">
                  <div className="cmt-name">{c.name}</div>
                  <div className="cmt-room">{c.room}</div>
                </div>
                <div className="cmt-date">{c.date}</div>
              </div>

              <div className="cmt-stars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarFilled
                    key={i}
                    className={i <= c.rating ? "cmt-star filled" : "cmt-star empty"}
                  />
                ))}
              </div>

              <p className="cmt-text">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
