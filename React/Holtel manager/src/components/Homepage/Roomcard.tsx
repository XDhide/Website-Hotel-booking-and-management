// src/components/Roomcard/Roomcard.tsx
import { useState } from "react";
import {
  HeartOutlined,
  HeartFilled,
  StarFilled,
  WifiOutlined,
  FireOutlined,
  TagOutlined,
} from "@ant-design/icons";
import "../../assets/css/Homepage/Roomcard.css";

export interface Room {
  id: number;
  name: string;
  type: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  tags: string[];
  available: boolean;
  popular?: boolean;
}

interface RoomCardProps {
  room: Room;
  compact?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="star-row">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarFilled
          key={i}
          className={i <= Math.round(rating) ? "star-filled" : "star-empty"}
        />
      ))}
    </span>
  );
}

export default function RoomCard({ room, compact = false }: RoomCardProps) {
  const [liked, setLiked] = useState(false);

  const discount = room.originalPrice
    ? Math.round((1 - room.price / room.originalPrice) * 100)
    : null;

  return (
    <div className={`room-card${compact ? " compact" : ""}`}>
      <div className="rc-img-wrap">
        {room.image ? (
          <img src={room.image} alt={room.name} className="rc-img" />
        ) : (
          <div className="rc-img-placeholder"><img src="" alt="Ảnh phòng" /></div>
        )}

        {!room.available && (
          <div className="rc-badge-full">HẾT PHÒNG</div>
        )}

        {room.popular && room.available && (
          <div className="rc-badge-popular">
            <FireOutlined style={{ marginRight: 4 }} />
            Phổ biến
          </div>
        )}

        {discount !== null && room.available && (
          <div className="rc-badge-discount">
            <TagOutlined style={{ marginRight: 3 }} />
            -{discount}%
          </div>
        )}

        <button
          className={`rc-like-btn${liked ? " liked" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setLiked((p) => !p);
          }}
        >
          {liked ? <HeartFilled /> : <HeartOutlined />}
        </button>
      </div>

      <div className="rc-body">
        <div className="rc-type">{room.type}</div>
        <div className={`rc-name${compact ? " compact" : ""}`}>{room.name}</div>

        <div className="rc-rating-row">
          <StarRating rating={room.rating} />
          <span className="rc-rating-num">{room.rating.toFixed(1)}</span>
          <span className="rc-reviews">({room.reviews} đánh giá)</span>
        </div>

        {!compact && (
          <div className="rc-tags">
            {room.tags.map((tag) => (
              <span key={tag} className="rc-tag">
                <WifiOutlined className="rc-tag-icon" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="rc-price-row">
          <div className="rc-price-group">
            <span className={`rc-price${compact ? " compact" : ""}`}>
              {room.price.toLocaleString("vi-VN")}₫
              <span className="rc-price-unit">/đêm</span>
            </span>
            {room.originalPrice && (
              <span className="rc-original-price">
                {room.originalPrice.toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>

          <button
            className={`rc-book-btn${room.available ? " available" : " disabled"}`}
            disabled={!room.available}
          >
            {room.available ? "Đặt ngay" : "Hết phòng"}
          </button>
        </div>
      </div>
    </div>
  );
}
