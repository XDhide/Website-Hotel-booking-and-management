import { useState, useEffect } from "react";
import { TrophyOutlined, LoadingOutlined } from "@ant-design/icons";
import RoomCard from "./Roomcard";
import { apiSearchRoomType } from "../../services/RoomTypeService";
import "../../assets/css/Homepage/TopRooms.css";

function mapRoomType(rt: any) {
  return {
    id:        rt.roomTypeId ?? rt.id,
    name:      rt.name ?? rt.typeName ?? "Phòng",
    type:      rt.typeName ?? rt.name ?? "Standard",
    price:     rt.pricePerNight ?? rt.basePrice ?? 0,
    rating:    rt.averageRating ?? 4.5,
    reviews:   rt.reviewCount ?? 0,
    image:     rt.images?.[0]?.imageUrl ?? rt.imageUrl ?? null,
    tags:      rt.amenities ? rt.amenities.split(",").map((s: string) => s.trim()) : [],
    available: rt.availableRooms > 0 ?? true,
    popular:   rt.isPopular ?? true,
  };
}

export default function TopRooms() {
  const [rooms,   setRooms]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiSearchRoomType(1, 10)
      .then((res) => setRooms((res?.data ?? []).map(mapRoomType).slice(0, 5)))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section top-rooms-section">
      <div className="container">
        <h2 className="section-title">
          <TrophyOutlined className="section-title-icon" />
          Phòng Phổ Biến Nhất
        </h2>
        <p className="section-subtitle">Top 5 phòng được đặt nhiều nhất</p>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <LoadingOutlined style={{ fontSize: 28 }} />
          </div>
        ) : rooms.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
            Chưa có dữ liệu phòng
          </div>
        ) : (
          <div className="room-grid">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} compact />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
