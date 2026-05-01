import { useState, useEffect } from "react";
import { HeartFilled, HeartOutlined, DeleteOutlined, ShoppingCartOutlined, LoadingOutlined } from "@ant-design/icons";
import RoomCard from "../components/Homepage/Roomcard";
import { apiSearchRoomType } from "../services/RoomTypeService";
import "../assets/css/Favorites/Favorites.css";
import Header from "../shared/Header";
import Footer from "../shared/Fooder";

const FAV_KEY = "hotel_favorites";

function getFavIds(): number[] {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]"); } catch { return []; }
}

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

export default function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const ids = getFavIds();
    if (ids.length === 0) { setLoading(false); return; }
    apiSearchRoomType(1, 100)
      .then((res) => {
        const all = (res?.data ?? []).map(mapRoomType);
        setFavorites(all.filter((r: any) => ids.includes(r.id)));
      })
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, []);

  const remove = (id: number) => {
    setFavorites((prev) => prev.filter((r) => r.id !== id));
    const ids = getFavIds().filter((i) => i !== id);
    localStorage.setItem(FAV_KEY, JSON.stringify(ids));
  };

  const clearAll = () => {
    setFavorites([]);
    localStorage.removeItem(FAV_KEY);
  };

  return (
    <>
      <Header />
      <div className="fav-page">
        <div className="fav-header">
          <div className="container">
            <div className="fav-header-row">
              <div>
                <h1 className="fav-title">
                  <HeartFilled className="fav-title-icon" />
                  Phòng Yêu Thích
                </h1>
                <p className="fav-sub">{favorites.length} phòng đã lưu</p>
              </div>
              {favorites.length > 0 && (
                <button className="fav-clear-btn" onClick={clearAll}>
                  <DeleteOutlined /> Xóa tất cả
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container fav-body">
          {loading ? (
            <div className="fav-empty">
              <LoadingOutlined style={{ fontSize: 32, marginBottom: 12 }} />
              <p>Đang tải...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="fav-empty">
              <div className="fav-empty-icon"><HeartOutlined /></div>
              <h2 className="fav-empty-title">Chưa có phòng yêu thích</h2>
              <p className="fav-empty-sub">
                Nhấn vào biểu tượng <HeartFilled style={{ color: "#ef4444" }} /> trên các phòng để lưu vào đây
              </p>
              <button className="fav-browse-btn">Khám phá phòng ngay</button>
            </div>
          ) : (
            <div className="fav-grid">
              {favorites.map((room) => (
                <div key={room.id} className="fav-item">
                  <RoomCard room={room} compact />
                  <button className="fav-remove-btn" onClick={() => remove(room.id)}>
                    <DeleteOutlined /> Bỏ yêu thích
                  </button>
                </div>
              ))}
            </div>
          )}

          {favorites.length > 0 && (
            <div className="fav-actions-bar">
              <span className="fav-actions-info">{favorites.length} phòng đã chọn</span>
              <button className="fav-book-all-btn">
                <ShoppingCartOutlined /> Đặt tất cả
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
