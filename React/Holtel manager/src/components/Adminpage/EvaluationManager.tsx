import { useState, useEffect, useCallback } from "react";
import {
  StarFilled,
  StarOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  apiGetAllEvaluations,
  apiDeleteEvaluation,
} from "../../services/EvaluationService";
import "../../assets/css/Adminpage/EvaluationManager.css";

interface Evaluation {
  evaluationId: number;
  userId: string;
  roomUseId: number;
  rating: number | null;
  comment: string;
  createdAt: string | null;
}

function Stars({ rating }: { rating: number | null }) {
  const r = rating ?? 0;
  return (
    <span className="eval-star-row">
      {[1, 2, 3, 4, 5].map((i) =>
        i <= r ? (
          <StarFilled key={i} className="eval-star-icon" />
        ) : (
          <StarOutlined key={i} className="eval-star-icon outline" />
        ),
      )}
    </span>
  );
}

export default function EvaluationManager() {
  const [items, setItems] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;

  const load = useCallback(
    async (p = page) => {
      setLoading(true);
      setError("");
      try {
        const res = await apiGetAllEvaluations(p, PAGE_SIZE);
        setItems(res?.data ?? []);
        setTotalPages(res?.totalPages ?? 1);
        setTotalCount(res?.totalCount ?? 0);
      } catch {
        setError("Không thể tải danh sách đánh giá.");
        setItems([]);
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
    ? items.filter(
        (e) =>
          e.comment?.toLowerCase().includes(search.toLowerCase()) ||
          e.userId?.toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xoá đánh giá này?")) return;
    const ok = await apiDeleteEvaluation(id);
    if (ok) load(page);
    else alert("Xoá thất bại.");
  };

  const avgRating =
    items.length > 0
      ? (
          items.reduce((s, e) => s + (e.rating ?? 0), 0) /
          items.filter((e) => e.rating).length
        ).toFixed(1)
      : "—";

  const fmtDate = (s: string | null) => {
    if (!s) return "—";
    try {
      return new Date(s).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return s;
    }
  };

  const pageNums = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => Math.max(1, Math.min(page - 2, totalPages - 4)) + i,
  ).filter((p) => p >= 1 && p <= totalPages);

  return (
    <div className="eval-container">
      <div className="eval-header">
        <div className="eval-header-left">
          <StarFilled className="eval-header-icon" />
          <span className="eval-title">Đánh giá</span>
          <span className="eval-count-badge">{totalCount} đánh giá</span>
          {avgRating !== "—" && (
            <span className="eval-avg-badge">
              <StarFilled className="eval-avg-icon" />
              <span className="eval-avg-value">{avgRating}</span>
              <span className="eval-avg-label">TB</span>
            </span>
          )}
        </div>
        <div className="eval-header-right">
          <div className="eval-search-box">
            <SearchOutlined className="eval-search-icon" />
            <input
              className="eval-search-input"
              placeholder="Tìm bình luận, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="eval-reload-btn" onClick={() => load(page)}>
            <ReloadOutlined />
          </button>
        </div>
      </div>

      {!loading && items.length > 0 && (
        <div className="eval-rating-bars">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = items.filter((e) => e.rating === star).length;
            const pct = items.length
              ? Math.round((count / items.length) * 100)
              : 0;
            return (
              <div key={star} className="eval-rating-bar-row">
                <span className="eval-star-num">{star}</span>
                <StarFilled className="eval-star-icon small" />
                <div className="eval-bar-track">
                  <div className="eval-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="eval-bar-count">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {error && <div className="eval-error-box">⚠ {error}</div>}

      <div className="eval-table-wrap">
        <table className="eval-table">
          <thead>
            <tr>
              {[
                "#",
                "User ID",
                "Phòng sử dụng",
                "Đánh giá",
                "Bình luận",
                "Ngày",
                "Xoá",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="eval-loading-cell">
                  Đang tải...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="eval-empty-cell">
                  {search ? "Không tìm thấy kết quả" : "Chưa có đánh giá nào"}
                </td>
              </tr>
            ) : (
              filtered.map((e, i) => (
                <tr key={e.evaluationId}>
                  <td className="eval-td-num">
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="eval-td-user">
                    <span title={e.userId}>
                      {e.userId.length > 16
                        ? e.userId.slice(0, 14) + "…"
                        : e.userId}
                    </span>
                  </td>
                  <td className="eval-td-room">
                    <span className="eval-room-badge">#{e.roomUseId}</span>
                  </td>
                  <td className="eval-td-rating">
                    <div className="eval-rating-row">
                      <Stars rating={e.rating} />
                      {e.rating && (
                        <span className="eval-rating-num">{e.rating}</span>
                      )}
                    </div>
                  </td>
                  <td className="eval-td-comment">
                    {e.comment ? (
                      <span className="eval-comment-clamp">{e.comment}</span>
                    ) : (
                      <span className="eval-no-comment">
                        Không có bình luận
                      </span>
                    )}
                  </td>
                  <td className="eval-td-date">{fmtDate(e.createdAt)}</td>
                  <td className="eval-td-action">
                    <button
                      className="eval-delete-btn"
                      onClick={() => handleDelete(e.evaluationId)}
                    >
                      <DeleteOutlined />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="eval-pagination">
          <span className="eval-pagination-info">
            Tổng {totalCount} đánh giá — Trang {page}/{totalPages}
          </span>
          <div className="eval-pagination-btns">
            <button
              className="eval-page-btn"
              disabled={page <= 1}
              onClick={() => setPage(1)}
            >
              «
            </button>
            <button
              className="eval-page-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹
            </button>
            {pageNums.map((p) => (
              <button
                key={p}
                className={`eval-page-btn${p === page ? " active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="eval-page-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </button>
            <button
              className="eval-page-btn"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
