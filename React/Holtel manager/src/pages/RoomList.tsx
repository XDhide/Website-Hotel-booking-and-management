import { apiGetRoomRateByRoomType } from "../services/RoomRateService";
import { useState, useEffect } from "react";
import {
  SearchOutlined,
  FilterOutlined,
  AppstoreOutlined,
  BarsOutlined,
  SortAscendingOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import RoomCard from "../components/Homepage/Roomcard";
import { apiSearchRoomType } from "../services/RoomTypeService";
import "../assets/css/RoomList/RoomList.css";
import Header from "../shared/Header";
import Footer from "../shared/Fooder";

const SORT_OPTIONS = [
  { value: "popular", label: "Phổ biến nhất" },
  { value: "price_asc", label: "Giá thấp → cao" },
  { value: "price_desc", label: "Giá cao → thấp" },
  { value: "rating", label: "Đánh giá cao nhất" },
];

async function fetchRatesForRoomTypes(
  ids: number[],
): Promise<Record<number, { day: number; hour: number }>> {
  const map: Record<number, { day: number; hour: number }> = {};
  await Promise.allSettled(
    ids.map(async (id) => {
      try {
        const data = await apiGetRoomRateByRoomType(id);
        const rates: any[] = Array.isArray(data) ? data : [];
        const active = rates.filter((r) => r.isActive !== false);
        const dayRate =
          active.find((r) => r.rentType === "Day") ??
          active.find((r) => r.rentType === "Night");
        const hourRate = active.find((r) => r.rentType === "Hour");
        map[id] = { day: dayRate?.price ?? 0, hour: hourRate?.price ?? 0 };
      } catch {
        map[id] = { day: 0, hour: 0 };
      }
    }),
  );
  return map;
}

function mapRoomType(
  rt: any,
  rateMap: Record<number, { day: number; hour: number }>,
) {
  const id = rt.roomTypeId ?? rt.id;
  const rates = rateMap[id] ?? { day: 0, hour: 0 };
  const basePrice = rates.day || rt.pricePerNight || rt.basePrice || 0;
  return {
    id,
    name: rt.name ?? rt.typeName ?? "Phòng",
    type: rt.typeName ?? rt.name ?? "Standard",
    price: basePrice,
    hourPrice: rates.hour,
    rating: rt.averageRating ?? 4.5,
    reviews: rt.reviewCount ?? 0,
    image: rt.images?.[0]?.imageUrl ?? rt.imageUrl ?? null,
    tags: rt.amenities
      ? rt.amenities.split(",").map((s: string) => s.trim())
      : [],
    available: (rt.availableRooms ?? 0) > 0,
    popular: rt.isPopular ?? false,
  };
}

export default function RoomList() {
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [priceMax, setPriceMax] = useState(10_000_000);

  useEffect(() => {
    setLoading(true);
    apiSearchRoomType(1, 100)
      .then(async (res) => {
        const items: any[] = res?.data ?? [];
        const ids = items.map((rt: any) => rt.roomTypeId ?? rt.id);
        const rateMap = await fetchRatesForRoomTypes(ids);
        setAllRooms(items.map((rt) => mapRoomType(rt, rateMap)));
      })
      .catch(() => setAllRooms([]))
      .finally(() => setLoading(false));
  }, []);

  let rooms = allRooms.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchAvail = !onlyAvail || r.available;
    const matchPrice = r.price === 0 || r.price <= priceMax;
    return matchSearch && matchAvail && matchPrice;
  });
  if (sort === "price_asc")
    rooms = [...rooms].sort((a, b) => a.price - b.price);
  if (sort === "price_desc")
    rooms = [...rooms].sort((a, b) => b.price - a.price);
  if (sort === "rating") rooms = [...rooms].sort((a, b) => b.rating - a.rating);

  return (
    <>
      <Header />
      <div className="rl-page">
        <div className="rl-header">
          <div className="container">
            <h1 className="rl-title">Danh Sách Phòng</h1>
            <p className="rl-sub">
              Khám phá {allRooms.length} loại phòng đa dạng
            </p>
          </div>
        </div>

        <div className="container rl-body">
          <aside className="rl-sidebar">
            <div className="rl-filter-box">
              <div className="rl-filter-title">
                <FilterOutlined /> Bộ lọc
              </div>

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

              <div className="rl-filter-group">
                <label className="rl-filter-label">
                  Giá tối đa:{" "}
                  <strong>{priceMax.toLocaleString("vi-VN")}₫</strong>
                </label>
                <input
                  type="range"
                  min={100_000}
                  max={10_000_000}
                  step={100_000}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="rl-range"
                />
                <div className="rl-range-labels">
                  <span>100K</span>
                  <span>10M</span>
                </div>
              </div>

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

          <main className="rl-main">
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
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rl-view-toggle">
                  <button
                    className={`rl-view-btn${view === "grid" ? " active" : ""}`}
                    onClick={() => setView("grid")}
                  >
                    <AppstoreOutlined />
                  </button>
                  <button
                    className={`rl-view-btn${view === "list" ? " active" : ""}`}
                    onClick={() => setView("list")}
                  >
                    <BarsOutlined />
                  </button>
                </div>
              </div>
            </div>
            {loading ? (
              <div className="rl-empty">
                <LoadingOutlined className="rl-loading-icon" />
                <p>Đang tải danh sách phòng...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="rl-empty">
                <div className="rl-empty-icon">
                  <SearchOutlined />
                </div>
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
      <Footer />
    </>
  );
}
