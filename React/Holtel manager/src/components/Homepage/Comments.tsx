import { useState, useEffect } from "react";
import { StarFilled, UserOutlined, LoadingOutlined } from "@ant-design/icons";
import { apiGetReviews } from "../../services/ReviewService";
import "../../assets/css/Homepage/Comments.css";

function StarRow({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarFilled
          key={i}
          className={`cmt-star ${i <= Math.round(rating) ? "cmt-star-filled" : ""}`}
        />
      ))}
    </span>
  );
}

export default function Comments() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetReviews(1, 6)
      .then((res) => setComments(res?.data ?? []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="section">
        <div className="container cmt-loading-container">
          <LoadingOutlined className="cmt-loading-icon" />
        </div>
      </section>
    );
  }

  if (comments.length === 0) return null;

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Đánh Giá Của Khách</h2>
        <div className="cmt-grid">
          {comments.map((c, i) => (
            <div key={c.evaluationId ?? c.id ?? i} className="cmt-card">
              <div className="cmt-header">
                <div className="cmt-avatar-placeholder">
                  <UserOutlined className="cmt-avatar-icon" />
                </div>
                <div className="cmt-meta">
                  <div className="cmt-name">
                    {c.userName ?? c.author ?? "Khách hàng"}
                  </div>
                  <div className="cmt-date">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString("vi-VN")
                      : ""}
                  </div>
                </div>
              </div>
              <StarRow rating={c.rating ?? 5} />
              <p className="cmt-text">{c.comment ?? c.text ?? ""}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
