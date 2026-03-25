// src/components/TopRooms/TopRooms.tsx
import { TrophyOutlined } from "@ant-design/icons";
import RoomCard from "./Roomcard";
import { ALL_ROOMS } from "./rooms";
import "./TopRooms.css";

export default function TopRooms() {
  const top5 = ALL_ROOMS.filter((r) => r.popular).slice(0, 5);

  return (
    <section className="section top-rooms-section">
      <div className="container">
        <h2 className="section-title">
          <TrophyOutlined className="section-title-icon" />
          Phòng Phổ Biến Nhất
        </h2>
        <p className="section-subtitle">Top 5 phòng được đặt nhiều nhất</p>
        <div className="room-grid">
          {top5.map((room) => (
            <RoomCard key={room.id} room={room} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
