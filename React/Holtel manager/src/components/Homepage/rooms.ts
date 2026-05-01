// File này chỉ giữ interface type — không còn dữ liệu hardcode.
// Dữ liệu phòng được load từ API /api/roomtype

export interface Room {
  id:             number;
  name:           string;
  type:           string;
  price:          number;
  originalPrice?: number;
  rating:         number;
  reviews:        number;
  image:          string | null;
  tags:           string[];
  available:      boolean;
  popular?:       boolean;
}

export interface Comment {
  id:     number;
  author: string;
  avatar: string;
  rating: number;
  date:   string;
  text:   string;
}

// Không còn ALL_ROOMS hay COMMENTS hardcode.
// Dùng apiSearchRoomType() từ RoomTypeService để lấy danh sách phòng.
// Dùng apiGetReviews() từ ReviewService để lấy đánh giá.
