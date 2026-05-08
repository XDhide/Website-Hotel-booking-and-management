import { useState, useEffect } from "react";
import {
  HeartFilled, HeartOutlined, DeleteOutlined,
  ShoppingCartOutlined, LoadingOutlined
} from "@ant-design/icons";
import RoomCard from "../components/Homepage/Roomcard";
import { apiGetFavorites, apiRemoveFavorite } from "../services/FavoriteService";
import type { FavoriteDto } from "../services/FavoriteService";
import { apiGetRoomTypeById } from "../services/RoomTypeService";
import { isLoggedIn } from "../constant/api";
import { navigate } from "../Approuter.tsx";
import "../assets/css/Favorites/Favorites.css";
import Header from "../shared/Header";
import Footer from "../shared/Fooder";
import type { Room } from "../components/Homepage/Roomcard";

function mapRoomType(rt: any): Room {
  return {
    id:        rt.roomTypeId ?? rt.id,
    name:      rt.name ?? rt.typeName ?? "Phòng",
    type:      rt.typeName ?? rt.name ?? "Standard",
    price:     rt.pricePerNight ?? rt.basePrice ?? 0,
    rating:    rt.averageRating ?? 4.5,
    reviews:   rt.reviewCount ?? 0,
    image:     rt.images?.[0]?.imageUrl ?? rt.imageUrl ?? null,
    tags:      rt.amenities ? rt.amenities.split(",").map((s: string) => s.trim()) : [],
    available: rt.availableRooms > 0,
    popular:   rt.isPopular ?? false,
  };
}

interface FavRoom {
  favoriteId: number;
  room: Room;
}

export default function Favorites() {
  const [favRooms, setFavRooms] = useState<FavRoom[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) { setLoading(false); return; }

    const load = async () => {
      try {
        const favList: FavoriteDto[] = await apiGetFavorites();
        if (favList.length === 0) { setFavRooms([]); return; }

        const results = await Promise.allSettled(
          favList.map(async (fav) => {
            const rt = await apiGetRoomTypeById(fav.roomTypeId);
            return rt ? { favoriteId: fav.favoriteId, room: mapRoomType(rt) } : null;
          })
        );

        const mapped = results
          .filter((r): r is PromiseFulfilledResult<FavRoom | null> => r.status === "fulfilled")
          .map((r) => r.value)
          .filter((v): v is FavRoom => v !== null);

        setFavRooms(mapped);
      } catch {
        setError("Không thể tải danh sách yêu thích.");
      }
    };

    load().finally(() => setLoading(false));
  }, []);

  const remove = async (roomTypeId: number) => {
    try {
      await apiRemoveFavorite(roomTypeId);
      setFavRooms((prev) => prev.filter((f) => f.room.id !== roomTypeId));
    } catch {}
  };
  const clearAll = async () => {
    for (const fav of favRooms) {
      try { await apiRemoveFavorite(fav.room.id); } catch {}
    }
    setFavRooms([]);
  };

  
  const handleFavoriteChange = (roomTypeId: number, liked: boolean) => {
    if (!liked) setFavRooms((prev) => prev.filter((f) => f.room.id !== roomTypeId));
  };

  if (!isLoggedIn()) {
    return (
      <>
        <Header />
        <div className="fav-page">
          <div className="container fav-body">
            <div className="fav-empty">
              <div className="fav-empty-icon"><HeartOutlined /></div>
              <h2 className="fav-empty-title">Vui lòng đăng nhập</h2>
              <p className="fav-empty-sub">Bạn cần đăng nhập để xem danh sách yêu thích.</p>
              <button className="fav-browse-btn" onClick={() => navigate("/login")}>
                Đăng nhập ngay
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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
                <p className="fav-sub">{favRooms.length} phòng đã lưu</p>
              </div>
              {favRooms.length > 0 && (
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
              <LoadingOutlined className="fav-loading-icon" />
              <p>Đang tải...</p>
            </div>
          ) : error ? (
            <div className="fav-empty">
              <p className="fav-error-text">{error}</p>
            </div>
          ) : favRooms.length === 0 ? (
            <div className="fav-empty">
              <div className="fav-empty-icon"><HeartOutlined /></div>
              <h2 className="fav-empty-title">Chưa có phòng yêu thích</h2>
              <p className="fav-empty-sub">
                Nhấn vào biểu tượng <HeartFilled className="fav-heart-icon" /> trên các phòng để lưu vào đây
              </p>
              <button className="fav-browse-btn" onClick={() => navigate("/rooms")}>
                Khám phá phòng ngay
              </button>
            </div>
          ) : (
            <div className="fav-grid">
              {favRooms.map(({ favoriteId, room }) => (
                <div key={favoriteId} className="fav-item">
                  <RoomCard
                    room={room}
                    compact
                    initialLiked={true}
                    onFavoriteChange={handleFavoriteChange}
                  />
                  <button className="fav-remove-btn" onClick={() => remove(room.id)}>
                    <DeleteOutlined /> Bỏ yêu thích
                  </button>
                </div>
              ))}
            </div>
          )}

          {favRooms.length > 0 && (
            <div className="fav-actions-bar">
              <span className="fav-actions-info">{favRooms.length} phòng đã chọn</span>
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
