import { useState, useEffect } from "react";
import {
  CalendarOutlined,
  SearchOutlined,
  UserOutlined,
  PlusOutlined,
  MinusOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FilterOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import RoomCard from "./Roomcard";
import { apiSearchRoomType } from "../../services/RoomTypeService";
import "../../assets/css/Homepage/CalendarSearch.css";
import { navigate } from "../../Approuter";

const ROOM_TYPES = [
  { value: "all",      label: "Tất cả" },
  { value: "Standard", label: "Tiêu chuẩn" },
  { value: "Deluxe",   label: "Deluxe" },
  { value: "Suite",    label: "Suite" },
  { value: "Family",   label: "Gia đình" },
];

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
    popular:   rt.isPopular ?? false,
  };
}

export default function CalendarSearch() {
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [checkIn,  setCheckIn]  = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomType, setRoomType] = useState("all");
  const [guests,   setGuests]   = useState(1);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    apiSearchRoomType(1, 100)
      .then((res) => setAllRooms((res?.data ?? []).map(mapRoomType)))
      .catch(() => setAllRooms([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = allRooms.filter((r) =>
    roomType === "all" ? true : r.type === roomType
  );

  const isHighDemand = checkIn !== "" && new Date(checkIn).getDay() === 6; 

  return (
    <section className="section cs-section">
      <div className="container">
        <h2 className="section-title">
          <CalendarOutlined className="section-title-icon" />
          Tìm Phòng Theo Ngày
        </h2>
        <p className="section-subtitle">Chọn ngày và loại phòng phù hợp với bạn</p>

        <div className="cs-layout">
          <div className="cs-panel">
            <h3 className="cs-panel-title">
              <FilterOutlined style={{ marginRight: 8 }} />
              Bộ lọc tìm kiếm
            </h3>

            <label className="cs-label">
              <CalendarOutlined className="cs-label-icon" /> Ngày nhận phòng
            </label>
            <input
              type="date" className="cs-input" min={today}
              value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
            />

            <label className="cs-label">
              <CalendarOutlined className="cs-label-icon" /> Ngày trả phòng
            </label>
            <input
              type="date" className="cs-input" min={checkIn || today}
              value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
            />

            <label className="cs-label">Loại phòng</label>
            <select className="cs-select" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
              {ROOM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <label className="cs-label">
              <UserOutlined className="cs-label-icon" /> Số khách
            </label>
            <div className="cs-guest-counter">
              <button className="cs-counter-btn" onClick={() => setGuests((g) => Math.max(1, g - 1))}>
                <MinusOutlined />
              </button>
              <span className="cs-guest-num">{guests}</span>
              <button className="cs-counter-btn" onClick={() => setGuests((g) => Math.min(8, g + 1))}>
                <PlusOutlined />
              </button>
            </div>

            {checkIn && (
              <div className={`cs-info-box ${isHighDemand ? "warning" : "success"}`}>
                {isHighDemand ? (
                  <><WarningOutlined style={{ marginRight: 6 }} />Cuối tuần rất đông! Đặt sớm để đảm bảo phòng.</>
                ) : (
                  <><CheckCircleOutlined style={{ marginRight: 6 }} />Còn nhiều phòng trống cho ngày này!</>
                )}
              </div>
            )}

            <button className="cs-search-btn" onClick={() => navigate("/rooms")}>
              <SearchOutlined style={{ marginRight: 8 }} />
              Tìm phòng
            </button>
          </div>

          <div className="cs-results">
            {loading ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <LoadingOutlined style={{ fontSize: 28 }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="cs-no-results">Không tìm thấy phòng phù hợp.</div>
            ) : (
              <div className="room-grid">
                {filtered.slice(0, 6).map((room) => (
                  <RoomCard key={room.id} room={room} compact />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
