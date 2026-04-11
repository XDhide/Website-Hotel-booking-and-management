import { useState } from "react";
import {
  SearchOutlined,
  FilterOutlined,
  AppstoreOutlined,
  BarsOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import RoomCard from "../components/Homepage/Roomcard";
import { ALL_ROOMS } from "../components/Homepage/rooms";
import "../assets/css/RoomList/RoomList.css";

const TYPES = ["Tất cả", "Standard", "Deluxe", "Suite", "Family", "Superior", "Executive"];
const SORT_OPTIONS = [
  { value: "popular", label: "Phổ biến nhất" },
  { value: "price_asc", label: "Giá thấp → cao" },
  { value: "price_desc", label: "Giá cao → thấp" },
  { value: "rating", label: "Đánh giá cao nhất" },
];

export default function RoomList() {
  const [search, setSearch]     = useState("");
  const [type, setType]         = useState("Tất cả");
  const [sort, setSort]         = useState("popular");
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [view, setView]         = useState<"grid" | "list">("grid");
  const [priceMax, setPriceMax] = useState(5_000_000);

  let rooms = ALL_ROOMS.filter((r) => {
    const matchType   = type === "Tất cả" || r.type === type;
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchAvail  = !onlyAvail || r.available;
    const matchPrice  = r.price <= priceMax;
    return matchType && matchSearch && matchAvail && matchPrice;
  });

  if (sort === "price_asc")  rooms = [...rooms].sort((a, b) => a.price - b.price);
  if (sort === "price_desc") rooms = [...rooms].sort((a, b) => b.price - a.price);
  if (sort === "rating")     rooms = [...rooms].sort((a, b) => b.rating - a.rating);

  return (
    <div className="rl-page">
      {/* Header */}
      <div className="rl-header">
        <div className="container">
          <h1 className="rl-title">Danh Sách Phòng</h1>
          <p className="rl-sub">Khám phá {ALL_ROOMS.length} loại phòng đa dạng</p>
        </div>
      </div>

      <div className="container rl-body">
        {/* Sidebar */}
        <aside className="rl-sidebar">
          <div className="rl-filter-box">
            <div className="rl-filter-title">
              <FilterOutlined /> Bộ lọc
            </div>

            {/* Search */}
            <div className="rl-filter-group">
              <label className="rl-filter-label">Tìm kiếm</label>
              <div className="rl-search-wrap">
                <SearchOutlined className="rl-search-icon" />
                <input
                  className="rl-search-input"
                  placeholder="Tên phòng..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Type */}
            <div className="rl-filter-group">
              <label className="rl-filter-label">Loại phòng</label>
              <div className="rl-type-list">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    className={`rl-type-btn${type === t ? " active" : ""}`}
                    onClick={() => setType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="rl-filter-group">
              <label className="rl-filter-label">
                Giá tối đa: <strong>{priceMax.toLocaleString("vi-VN")}₫</strong>
              </label>
              <input
                type="range"
                min={400_000}
                max={5_000_000}
                step={100_000}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="rl-range"
              />
              <div className="rl-range-labels">
                <span>400K</span><span>5M</span>
              </div>
            </div>

            {/* Available */}
            <div className="rl-filter-group">
              <label className="rl-checkbox-label">
                <input
                  type="checkbox"
                  checked={onlyAvail}
                  onChange={(e) => setOnlyAvail(e.target.checked)}
                  className="rl-checkbox"
                />
                Chỉ phòng còn trống
              </label>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="rl-main">
          {/* Toolbar */}
          <div className="rl-toolbar">
            <span className="rl-count">{rooms.length} phòng</span>
            <div className="rl-toolbar-right">
              <div className="rl-sort-wrap">
                <SortAscendingOutlined />
                <select
                  className="rl-sort-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="rl-view-toggle">
                <button
                  className={`rl-view-btn${view === "grid" ? " active" : ""}`}
                  onClick={() => setView("grid")}
                ><AppstoreOutlined /></button>
                <button
                  className={`rl-view-btn${view === "list" ? " active" : ""}`}
                  onClick={() => setView("list")}
                ><BarsOutlined /></button>
              </div>
            </div>
          </div>

          {rooms.length === 0 ? (
            <div className="rl-empty">
              <div className="rl-empty-icon"><SearchOutlined /></div>
              <p>Không tìm thấy phòng phù hợp</p>
            </div>
          ) : (
            <div className={view === "grid" ? "room-grid" : "rl-list"}>
              {rooms.map((r) => (
                <RoomCard key={r.id} room={r} compact={view === "grid"} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
