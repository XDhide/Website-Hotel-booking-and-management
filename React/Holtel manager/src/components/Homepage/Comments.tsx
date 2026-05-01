import { useState, useEffect } from "react";
import { StarFilled, UserOutlined, LoadingOutlined } from "@ant-design/icons";
import { apiGetReviews } from "../../services/ReviewService";

function StarRow({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarFilled key={i} style={{ color: i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0", fontSize: 14 }} />
      ))}
    </span>
  );
}

export default function Comments() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    apiGetReviews(1, 6)
      .then((res) => setComments(res?.data ?? []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="section">
        <div className="container" style={{ textAlign: "center", padding: 40 }}>
          <LoadingOutlined style={{ fontSize: 28 }} />
        </div>
      </section>
    );
  }

  if (comments.length === 0) return null;

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Đánh Giá Của Khách</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {comments.map((c, i) => (
            <div key={c.evaluationId ?? c.id ?? i} style={{
              background: "var(--bg-secondary, #1e293b)",
              borderRadius: 12,
              padding: 20,
              border: "1px solid var(--border, #334155)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <UserOutlined style={{ color: "#fff" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    {c.userName ?? c.author ?? "Khách hàng"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString("vi-VN") : ""}
                  </div>
                </div>
              </div>
              <StarRow rating={c.rating ?? 5} />
              <p style={{ marginTop: 10, fontSize: "0.875rem", color: "#cbd5e1", lineHeight: 1.6 }}>
                {c.comment ?? c.text ?? ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
