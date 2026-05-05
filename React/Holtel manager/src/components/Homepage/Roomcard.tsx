import { useState } from "react";
import { HeartOutlined, HeartFilled, StarFilled, FireOutlined, TagOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { navigate } from "../../Approuter.tsx";
import "../../assets/css/Homepage/Roomcard.css";

export interface Room {
  id:             number;
  name:           string;
  type:           string;
  price:          number;         
  hourPrice?:     number;         
  originalPrice?: number;
  rating:         number;
  reviews:        number;
  image:          string | null;
  tags:           string[];
  available:      boolean;
  popular?:       boolean;
}

interface RoomCardProps { room: Room; compact?: boolean; }

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="star-row">
      {[1,2,3,4,5].map(i=>(
        <StarFilled key={i} className={i<=Math.round(rating)?"star-filled":"star-empty"}/>
      ))}
    </span>
  );
}

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(v??0);

export default function RoomCard({ room, compact=false }: RoomCardProps) {
  const [liked, setLiked] = useState(false);
  const discount = room.originalPrice ? Math.round((1-room.price/room.originalPrice)*100) : null;
  const hasImage = room.image && room.image.trim()!=="";

  return (
    <div className={`room-card${compact?" compact":""}`} onClick={()=>navigate(`/rooms/${room.id}`)} style={{cursor:"pointer"}}>
      <div className="rc-img-wrap">
        {hasImage
          ? <img src={room.image!} alt={room.name} className="rc-img"/>
          : <div className="rc-img-placeholder" aria-label="Ảnh phòng"/>}
        {!room.available&&<div className="rc-badge-full">HẾT PHÒNG</div>}
        {room.popular&&room.available&&<div className="rc-badge-popular"><FireOutlined style={{marginRight:4}}/>Phổ biến</div>}
        {discount!==null&&room.available&&<div className="rc-badge-discount"><TagOutlined style={{marginRight:3}}/>{-discount}%</div>}
        <button className={`rc-like-btn${liked?" liked":""}`}
          onClick={e=>{e.stopPropagation();setLiked(p=>!p);}}>
          {liked?<HeartFilled/>:<HeartOutlined/>}
        </button>
      </div>

      <div className="rc-body">
        <div className="rc-type">{room.type}</div>
        <div className={`rc-name${compact?" compact":""}`}>{room.name}</div>
        <div className="rc-rating-row">
          <StarRating rating={room.rating}/>
          <span className="rc-rating-num">{room.rating.toFixed(1)}</span>
          <span className="rc-reviews">({room.reviews} đánh giá)</span>
        </div>

        <div className="rc-price-row">
          <div className="rc-price-group">
            {room.price > 0 ? (<>
              <span className={`rc-price${compact?" compact":""}`}>
                {fmt(room.price)}<span className="rc-price-unit">/ngày</span>
              </span>
              {room.originalPrice&&(
                <span className="rc-original-price">{fmt(room.originalPrice)}</span>
              )}
              {room.hourPrice&&room.hourPrice>0&&(
                <div style={{fontSize:"0.75rem",color:"#64748b",marginTop:2}}>
                  <ClockCircleOutlined style={{marginRight:3,color:"#f59e0b"}}/>
                  {fmt(room.hourPrice)}/giờ
                </div>
              )}
            </>) : (
              <span className="rc-price" style={{fontSize:"0.85rem",color:"#64748b"}}>Liên hệ để biết giá</span>
            )}
          </div>
          <button
            className={`rc-book-btn${room.available?" available":" disabled"}`}
            disabled={!room.available}
            onClick={e=>{e.stopPropagation();if(room.available)navigate(`/rooms/${room.id}`);}}>
            {room.available?"Đặt ngay":"Hết phòng"}
          </button>
        </div>
      </div>
    </div>
  );
}
