// src/pages/CurrentBookings.tsx
import { useState } from "react";
import {
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  TagOutlined,
  CheckCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import BookingDetail from "./BookingDetail";
import "../assets/css/Profile/CurrentBookings.css";

export interface BookingRoom {
  id: number;
  roomNumber: string;
  name: string;
  type: string;
  guests: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  code: string;
  pricePerNight: number;
  services: { label: string; amount: number }[];
}

const CURRENT_BOOKINGS: BookingRoom[] = [
  {
    id: 1,
    roomNumber: "203",
    name: "Phòng Deluxe Hướng Biển",
    type: "Deluxe",
    guests: 2,
    checkIn: "10/06/2025",
    checkOut: "13/06/2025",
    nights: 3,
    code: "BK001",
    pricePerNight: 1_200_000,
    services: [
      { label: "Tiền phòng (3 đêm)", amount: 3_600_000 },
      { label: "Minibar", amount: 150_000 },
      { label: "Giặt ủi", amount: 80_000 },
    ],
  },
  {
    id: 2,
    roomNumber: "501",
    name: "Suite Cao Cấp",
    type: "Suite",
    guests: 2,
    checkIn: "12/06/2025",
    checkOut: "14/06/2025",
    nights: 2,
    code: "BK002",
    pricePerNight: 2_800_000,
    services: [
      { label: "Tiền phòng (2 đêm)", amount: 5_600_000 },
      { label: "Dịch vụ Spa", amount: 500_000 },
    ],
  },
  {
    id: 3,
    roomNumber: "312",
    name: "Phòng Gia Đình",
    type: "Family",
    guests: 4,
    checkIn: "11/06/2025",
    checkOut: "15/06/2025",
    nights: 4,
    code: "BK003",
    pricePerNight: 1_800_000,
    services: [
      { label: "Tiền phòng (4 đêm)", amount: 7_200_000 },
      { label: "Bữa sáng (x4)", amount: 480_000 },
      { label: "Giặt ủi", amount: 120_000 },
    ],
  },
];

export default function CurrentBookings() {
  const [selected, setSelected] = useState<BookingRoom | null>(null);

  if (selected) {
    return (
      <BookingDetail
        booking={selected}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="cb-page">
      <div className="cb-header">
        <div className="container">
          <h1 className="cb-title">
            <HomeOutlined /> Phòng Đang Đặt
          </h1>
          <p className="cb-sub">Bạn đang có {CURRENT_BOOKINGS.length} phòng trong thời gian lưu trú</p>
        </div>
      </div>

      <div className="container cb-body">
        <div className="cb-list">
          {CURRENT_BOOKINGS.map((booking) => (
            <div
              key={booking.id}
              className="cb-card"
              onClick={() => setSelected(booking)}
            >
              <div className="cb-card-icon">
                <HomeOutlined />
              </div>

              <div className="cb-card-info">
                <div className="cb-room-number">Phòng {booking.roomNumber}</div>
                <div className="cb-room-name">{booking.name}</div>
                <div className="cb-room-meta">
                  <span className="cb-meta-badge blue">
                    <TagOutlined /> {booking.type}
                  </span>
                  <span className="cb-meta-badge green">
                    <CheckCircleOutlined /> Đang ở
                  </span>
                  <span className="cb-meta-badge amber">
                    <CalendarOutlined /> {booking.nights} đêm
                  </span>
                  <span className="cb-meta-badge amber">
                    <TeamOutlined /> {booking.guests} khách
                  </span>
                </div>
                <div className="cb-date-row">
                  <CalendarOutlined className="cb-date-icon" />
                  <span>Check-in: {booking.checkIn}</span>
                  <span className="cb-date-sep">·</span>
                  <span>Check-out: {booking.checkOut}</span>
                </div>
              </div>

              <div className="cb-card-right">
                <div className="cb-price-amount">
                  {booking.pricePerNight.toLocaleString("vi-VN")}₫
                </div>
                <div className="cb-price-night">/đêm</div>
                <RightOutlined className="cb-chevron" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
