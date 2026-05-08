import { useState } from "react";
import {
  StarFilled,
  StarOutlined,
  HomeOutlined,
  CloseOutlined,
  SendOutlined,
  LoadingOutlined,
  CheckCircleFilled,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { apiCreateEvaluation } from "../../services/EvaluationService";
import { getUser } from "../../constant/api";
import "../../assets/css/Profile/RatingModal.css";

interface RatingModalProps {
  bookingId: number;
  roomUseId: number;
  roomTypeName?: string;
  roomNumber?: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

const STAR_HINTS = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"];

export default function RatingModal({
  bookingId,
  roomUseId,
  roomTypeName,
  roomNumber,
  onClose,
  onSubmitted,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const displayRating = hovered || rating;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const user = getUser();
      await apiCreateEvaluation({
        userId: user?.userName ?? "",
        roomUseId,
        rating,
        comment: comment.trim(),
      });
      setSuccess(true);
      onSubmitted?.();
      setTimeout(() => onClose(), 2000);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.response?.data ??
        e?.message ??
        "Gửi đánh giá thất bại, vui lòng thử lại.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rm-overlay" onClick={onClose}>
      <div className="rm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rm-header">
          <div className="rm-header-left">
            <div className="rm-header-icon">⭐</div>
            <div>
              <p className="rm-header-title">Đánh giá phòng</p>
              <p className="rm-header-sub">Booking #{bookingId}</p>
            </div>
          </div>
          <button className="rm-close" onClick={onClose}>
            <CloseOutlined />
          </button>
        </div>

        {success ? (
          <div className="rm-success">
            <div className="rm-success-icon">
              <CheckCircleFilled />
            </div>
            <p className="rm-success-title">Cảm ơn đánh giá của bạn!</p>
            <p className="rm-success-sub">
              Đánh giá đã được ghi nhận thành công.
            </p>
          </div>
        ) : (
          <>
            <div className="rm-body">
              <div className="rm-room-info">
                <HomeOutlined className="rm-room-icon" />
                <div>
                  <p className="rm-room-name">
                    {roomTypeName ?? `Booking #${bookingId}`}
                  </p>
                  {roomNumber && (
                    <p className="rm-room-num">Phòng {roomNumber}</p>
                  )}
                </div>
              </div>

              <p className="rm-label">Chất lượng phòng *</p>
              <div className="rm-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`rm-star${displayRating >= star ? " filled" : ""}`}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(star)}
                  >
                    {displayRating >= star ? <StarFilled /> : <StarOutlined />}
                  </span>
                ))}
              </div>
              <p className="rm-star-hint">
                {STAR_HINTS[displayRating] || "Chọn số sao để đánh giá"}
              </p>

              <p className="rm-label">Nhận xét</p>
              <textarea
                className="rm-comment"
                placeholder="Chia sẻ trải nghiệm của bạn về phòng, dịch vụ, tiện nghi... (không bắt buộc)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={4}
              />
              <p className="rm-comment-count">{comment.length}/500</p>

              {error && (
                <div className="rm-error">
                  <ExclamationCircleOutlined />
                  {error}
                </div>
              )}
            </div>

            <div className="rm-footer">
              <button className="rm-btn-cancel" onClick={onClose}>
                Hủy
              </button>
              <button
                className={`rm-btn-submit ${rating > 0 && !submitting ? "enabled" : "disabled"}`}
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
              >
                {submitting ? (
                  <>
                    <LoadingOutlined /> Đang gửi...
                  </>
                ) : (
                  <>
                    <SendOutlined /> Gửi đánh giá
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
