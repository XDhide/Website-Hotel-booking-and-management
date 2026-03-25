// src/components/Banner/Banner.tsx
import { useState, useEffect } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import "./Banner.css";

const BANNERS = [
  { bg: "#dbeafe", title: "Chào mừng đến LuxStay", sub: "Trải nghiệm lưu trú đẳng cấp 5 sao" },
  { bg: "#e0f2fe", title: "Phòng View Biển",        sub: "Tận hưởng bình minh trên sóng nước" },
  { bg: "#ede9fe", title: "Spa & Thư Giãn",          sub: "Gói nghỉ dưỡng cao cấp chỉ từ 2.5 triệu" },
  { bg: "#fef3c7", title: "Ẩm Thực Tinh Tế",         sub: "Nhà hàng 5 sao ngay trong khách sạn" },
  { bg: "#dcfce7", title: "Hồ Bơi Vô Cực",           sub: "Thư giãn với view toàn thành phố" },
];

export default function Banner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setCurrent((p) => (p + 1) % BANNERS.length),
      3500
    );
    return () => clearInterval(id);
  }, []);

  const b = BANNERS[current];
  const prev = () => setCurrent((p) => (p - 1 + BANNERS.length) % BANNERS.length);
  const next = () => setCurrent((p) => (p + 1) % BANNERS.length);

  return (
    <div className="banner-wrap" style={{ backgroundColor: b.bg }}>
      <div className="banner-content">
        <div className="banner-title">{b.title}</div>
        <div className="banner-sub">{b.sub}</div>
      </div>

      <button className="banner-arrow banner-arrow-left" onClick={prev}>
        <LeftOutlined />
      </button>
      <button className="banner-arrow banner-arrow-right" onClick={next}>
        <RightOutlined />
      </button>

      <div className="banner-dots">
        {BANNERS.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            className={`banner-dot${i === current ? " active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
