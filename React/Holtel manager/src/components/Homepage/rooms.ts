// src/data/rooms.ts
import type { Room } from "../components/Roomcard/Roomcard";

export const ALL_ROOMS: Room[] = [
  {
    id: 1,
    name: "Phòng Deluxe Hướng Biển",
    type: "Deluxe",
    price: 1_200_000,
    originalPrice: 1_500_000,
    rating: 4.8,
    reviews: 312,
    image: "",
    tags: ["WiFi", "Minibar", "View biển", "Bồn tắm"],
    available: true,
    popular: true,
  },
  {
    id: 2,
    name: "Suite Cao Cấp",
    type: "Suite",
    price: 2_800_000,
    rating: 4.9,
    reviews: 187,
    image: "",
    tags: ["WiFi", "Phòng khách", "Bếp mini", "Ban công"],
    available: true,
    popular: true,
  },
  {
    id: 3,
    name: "Phòng Tiêu Chuẩn",
    type: "Standard",
    price: 650_000,
    rating: 4.5,
    reviews: 521,
    image: "",
    tags: ["WiFi", "Điều hòa", "TV"],
    available: true,
    popular: true,
  },
  {
    id: 4,
    name: "Phòng Gia Đình",
    type: "Family",
    price: 1_800_000,
    originalPrice: 2_200_000,
    rating: 4.7,
    reviews: 98,
    image: "",
    tags: ["2 giường đôi", "WiFi", "Sofa"],
    available: true,
    popular: true,
  },
  {
    id: 5,
    name: "Phòng Superior Twin",
    type: "Superior",
    price: 980_000,
    rating: 4.6,
    reviews: 234,
    image: "",
    tags: ["2 giường đơn", "WiFi", "Ban công"],
    available: true,
    popular: true,
  },
  {
    id: 6,
    name: "Phòng Executive",
    type: "Executive",
    price: 3_500_000,
    rating: 5.0,
    reviews: 56,
    image: "",
    tags: ["Phòng lớn", "Jacuzzi", "Butler"],
    available: false,
  },
  {
    id: 7,
    name: "Phòng Budget",
    type: "Standard",
    price: 480_000,
    rating: 4.2,
    reviews: 410,
    image: "",
    tags: ["WiFi", "Điều hòa"],
    available: false,
  },
  {
    id: 8,
    name: "Phòng Deluxe Twin",
    type: "Deluxe",
    price: 1_100_000,
    originalPrice: 1_300_000,
    rating: 4.7,
    reviews: 167,
    image: "",
    tags: ["WiFi", "Minibar", "View thành phố"],
    available: true,
  },
];

export interface Comment {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  room: string;
  date: string;
  text: string;
}

export const COMMENTS: Comment[] = [
  {
    id: 1,
    name: "Trần Minh Khoa",
    avatar: "https://i.pravatar.cc/40?img=12",
    rating: 5,
    room: "Phòng Suite Cao Cấp",
    date: "12/01/2025",
    text: "Phòng rất đẹp và sạch sẽ. Nhân viên phục vụ chu đáo, nhiệt tình. Tôi sẽ quay lại lần sau!",
  },
  {
    id: 2,
    name: "Nguyễn Thị Lan",
    avatar: "https://i.pravatar.cc/40?img=25",
    rating: 4,
    room: "Phòng Deluxe Hướng Biển",
    date: "05/01/2025",
    text: "View biển tuyệt đẹp, buổi sáng nhìn ra biển rất thư giãn. Bữa sáng ngon, phong phú.",
  },
  {
    id: 3,
    name: "Lê Quốc Hùng",
    avatar: "https://i.pravatar.cc/40?img=33",
    rating: 5,
    room: "Phòng Gia Đình",
    date: "28/12/2024",
    text: "Đi cùng gia đình 2 con nhỏ, phòng rộng rãi tiện nghi. Bể bơi trẻ em rất an toàn.",
  },
  {
    id: 4,
    name: "Phạm Thu Hà",
    avatar: "https://i.pravatar.cc/40?img=47",
    rating: 4,
    room: "Phòng Tiêu Chuẩn",
    date: "20/12/2024",
    text: "Giá cả hợp lý, phòng gọn gàng sạch sẽ. Vị trí trung tâm rất tiện đi lại.",
  },
];
