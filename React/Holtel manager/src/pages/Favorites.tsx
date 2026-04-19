import { useState } from "react";
import { HeartFilled, HeartOutlined, DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import RoomCard from "../components/Homepage/Roomcard";
import { ALL_ROOMS } from "../components/Homepage/rooms";
import "../assets/css/Favorites/Favorites.css";

export default function Favorites() {
  const [favorites, setFavorites] = useState(ALL_ROOMS.slice(0, 4));

  const remove = (id: number) => setFavorites((prev) => prev.filter((r) => r.id !== id));
  const clearAll = () => setFavorites([]);

  return (
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
        {favorites.length === 0 ? (
          <div className="fav-empty">
            <div className="fav-empty-icon"><HeartOutlined /></div>
            <h2 className="fav-empty-title">Chưa có phòng yêu thích</h2>
            <p className="fav-empty-sub">Nhấn vào biểu tượng <HeartFilled style={{ color: "#ef4444" }} /> trên các phòng để lưu vào đây</p>
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
            <span className="fav-actions-info">
              {favorites.length} phòng đã chọn
            </span>
            <button className="fav-book-all-btn">
              <ShoppingCartOutlined /> Đặt tất cả
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
