import { useState, useEffect } from "react";
import { isLoggedIn } from "../constant/api";
import {
  LeftOutlined, StarFilled, HeartOutlined, HeartFilled,
  HomeOutlined, PictureOutlined, FireOutlined, ClockCircleOutlined,
  CalendarOutlined, CheckCircleOutlined, LoadingOutlined, UserOutlined,
} from "@ant-design/icons";
import { apiGetReviews } from "../services/ReviewService";
import { navigate } from "../Approuter.tsx";
import Header from "../shared/Header";
import Footer from "../shared/Fooder";
import { apiGetRoomTypeById } from "../services/RoomTypeService";
import { apiClient } from "../constant/api";
import { API } from "../constant/config";
import "../assets/css/RoomDetail/RoomDetail.css";

interface RoomRate { roomRateId: number; rentType: string; price: number; isActive: boolean; }
interface Props { roomTypeId?: number; }

const RENT_LABEL: Record<string, string> = {
  Night:"Theo đêm", Day:"Theo ngày", Hour:"Theo giờ",
  Weekend:"Cuối tuần", Holiday:"Ngày lễ", Weekday:"Ngày thường",
};
const RENT_UNIT: Record<string, string> = {
  Night:"/đêm", Day:"/ngày", Hour:"/giờ",
  Weekend:"/cuối tuần", Holiday:"/ngày lễ", Weekday:"/ngày thường",
};
const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(v??0);

export default function RoomDetail({ roomTypeId }: Props) {
  const [roomType, setRoomType]   = useState<any>(null);
  const [rates, setRates]         = useState<RoomRate[]>([]);
  const [loading, setLoading]     = useState(true);
  const [liked, setLiked]         = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [reviews, setReviews]     = useState<any[]>([]);
  const [tab, setTab]             = useState<"info"|"reviews">("info");
  const [showBooking, setShowBooking] = useState(false);
  const [rentType, setRentType]   = useState<"Day"|"Hour">("Day");
  const [fromDate, setFromDate]   = useState("");
  const [toDate, setToDate]       = useState("");
  const [fromHour, setFromHour]   = useState("");
  const [toHour, setToHour]       = useState("");
  const [guests, setGuests]       = useState(1);
  const [booking, setBooking]     = useState(false);
  const [bookingDone, setBookingDone] = useState(false);
  const [bookingErr, setBookingErr]   = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    apiGetReviews(1,20).then(res=>setReviews(res?.data??[])).catch(()=>setReviews([]));
  },[]);

  useEffect(() => {
    if (!roomTypeId) { setLoading(false); return; }
    Promise.all([
      apiGetRoomTypeById(roomTypeId),
      apiClient.get(`${API}/roomrate/by-roomtype/${roomTypeId}`).then(r=>r.data).catch(()=>[]),
    ]).then(([rt,rr]) => {
      setRoomType(rt);
      const activeRates = Array.isArray(rr) ? rr.filter((r:RoomRate)=>r.isActive!==false) : [];
      setRates(activeRates);
    }).finally(()=>setLoading(false));
  },[roomTypeId]);

  const images: any[] = roomType?.images??[];
  const dayRate  = rates.find(r=>r.rentType==="Day")??rates.find(r=>r.rentType==="Night");
  const hourRate = rates.find(r=>r.rentType==="Hour");
  const selectedRate = rates.find(r=>r.rentType===rentType)??(rentType==="Day"?dayRate:hourRate);

  const calcEstimate = () => {
    if (!selectedRate) return 0;
    if (rentType==="Day") {
      if (!fromDate||!toDate) return 0;
      const days=Math.max(0,Math.ceil((new Date(toDate).getTime()-new Date(fromDate).getTime())/86400000));
      return days*selectedRate.price;
    } else {
      if (!fromHour||!toHour) return 0;
      const [fh,fm]=fromHour.split(":").map(Number);
      const [th,tm]=toHour.split(":").map(Number);
      const hours=Math.max(0,(th*60+tm-fh*60-fm)/60);
      return Math.ceil(hours)*selectedRate.price;
    }
  };
  const estimate=calcEstimate();

  const handleBook = async () => {
    if (!isLoggedIn()) { navigate("/"); return; }
    setBookingErr("");
    if (rentType==="Day") {
      if (!fromDate||!toDate) { setBookingErr("Vui lòng chọn ngày nhận và trả phòng."); return; }
      if (new Date(toDate)<=new Date(fromDate)) { setBookingErr("Ngày trả phòng phải sau ngày nhận phòng."); return; }
    } else {
      if (!fromDate||!fromHour||!toHour) { setBookingErr("Vui lòng điền đầy đủ thông tin giờ thuê."); return; }
      if (fromHour>=toHour) { setBookingErr("Giờ trả phòng phải sau giờ nhận phòng."); return; }
    }
    setBooking(true);
    try {
      const token=localStorage.getItem("hotel_token")??"";
      let userId="";
      try { const p=JSON.parse(atob(token.split(".")[1])); userId=p?.sub??p?.nameid??""; } catch{}
      let ciDateTime=fromDate, coDateTime=toDate;
      if (rentType==="Hour") { ciDateTime=`${fromDate}T${fromHour}:00`; coDateTime=`${fromDate}T${toHour}:00`; }
      await apiClient.post(`${API}/booking`,{
        userId, roomTypeId, fromDate:ciDateTime, toDate:coDateTime,
        status:"Pending", rentType, createdAt:new Date().toISOString(),
      });
      setBookingDone(true);
    } catch(e:any) {
      setBookingErr(e?.response?.data??e?.message??"Đặt phòng thất bại.");
    } finally { setBooking(false); }
  };

  const resetBooking = () => {
    setShowBooking(false); setBookingDone(false); setBookingErr("");
    setFromDate(""); setToDate(""); setFromHour(""); setToHour(""); setRentType("Day");
  };

  if (loading) return (<div className="rd-page"><Header/><div className="container rd-body" style={{justifyContent:"center",padding:"80px 0"}}><LoadingOutlined style={{fontSize:32}}/></div><Footer/></div>);
  if (!roomType) return (<div className="rd-page"><Header/><div className="container rd-body" style={{justifyContent:"center",padding:"80px 0"}}><p>Không tìm thấy loại phòng.</p></div><Footer/></div>);

  return (
    <div className="rd-page">
      <Header/>
      <div className="rd-back-bar"><div className="container">
        <button className="rd-back-btn" onClick={()=>navigate("/rooms")}><LeftOutlined/> Quay lại danh sách</button>
      </div></div>

      <div className="container rd-body">
        <div className="rd-left">
          <div className="rd-img-grid">
            {images.length>0 ? (<>
              <div className="rd-img-main">
                <img src={images[activeImg]?.imageUrl} alt={roomType.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:8}}/>
              </div>
              {images.slice(1,5).map((img:any,idx:number)=>(
                <div key={img.id} className="rd-img-sub" style={{cursor:"pointer"}} onClick={()=>setActiveImg(idx+1)}>
                  <img src={img.imageUrl} alt={img.altText||roomType.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:8}}/>
                </div>
              ))}
              {Array.from({length:Math.max(0,4-(images.length-1))}).map((_,i)=>(
                <div key={`ph-${i}`} className="rd-img-sub rd-img-placeholder"><PictureOutlined/></div>
              ))}
            </>) : (<>
              <div className="rd-img-main rd-img-placeholder"><HomeOutlined/></div>
              {[0,1,2,3].map(i=><div key={i} className="rd-img-sub rd-img-placeholder"><PictureOutlined/></div>)}
            </>)}
          </div>
          {images.length>1&&(<div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
            {images.map((img:any,idx:number)=>(
              <img key={img.id} src={img.imageUrl} alt={`Ảnh ${idx+1}`} onClick={()=>setActiveImg(idx)}
                style={{width:56,height:56,objectFit:"cover",borderRadius:6,cursor:"pointer",
                  border:activeImg===idx?"2px solid #6366f1":"2px solid transparent"}}/>
            ))}
          </div>)}

          <div className="rd-info-card">
            <div className="rd-info-top">
              <div>
                <span className="rd-type-badge">{roomType.name}</span>
                {roomType.capacity&&<span className="rd-popular-badge"><FireOutlined/> {roomType.capacity}</span>}
              </div>
              <button className="rd-action-btn" onClick={()=>setLiked(p=>!p)}>
                {liked?<HeartFilled style={{color:"#ef4444"}}/>:<HeartOutlined/>}
              </button>
            </div>
            <h1 className="rd-name">{roomType.name}</h1>
            <div className="rd-rating-row">
              {[1,2,3,4,5].map(i=><StarFilled key={i} className="rd-star filled"/>)}
              <span className="rd-rating-num">5.0</span>
              <span className="rd-reviews">({reviews.length} đánh giá)</span>
            </div>

            {/* Rate cards */}
            {rates.length>0&&(
              <div style={{margin:"16px 0"}}>
                <h3 className="rd-section-title">Bảng giá</h3>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10}}>
                  {rates.map(r=>(
                    <div key={r.roomRateId} style={{
                      background:"linear-gradient(135deg,#eff6ff,#dbeafe)",
                      border:"1.5px solid #bfdbfe",borderRadius:12,padding:"12px 14px",textAlign:"center",
                    }}>
                      <div style={{fontSize:"0.75rem",color:"#3b82f6",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4}}>
                        {RENT_LABEL[r.rentType]??r.rentType}
                      </div>
                      <div style={{fontSize:"1.15rem",color:"#1e40af",fontWeight:800}}>{fmt(r.price)}</div>
                      <div style={{fontSize:"0.75rem",color:"#6b7280"}}>{RENT_UNIT[r.rentType]??""}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rd-tabs">
              <button className={`rd-tab${tab==="info"?" active":""}`} onClick={()=>setTab("info")}>Thông tin</button>
              <button className={`rd-tab${tab==="reviews"?" active":""}`} onClick={()=>setTab("reviews")}>Đánh giá ({reviews.length})</button>
            </div>

            {tab==="info" ? (<>
              {roomType.description&&<p className="rd-desc">{roomType.description}</p>}
              {roomType.capacity&&(
                <div style={{display:"flex",alignItems:"center",gap:8,color:"#64748b",fontSize:"0.9rem",marginBottom:12}}>
                  <UserOutlined/> Sức chứa: {roomType.capacity} khách
                </div>
              )}
            </>) : (
              <div className="rd-reviews-list">
                {reviews.length===0
                  ? <div style={{textAlign:"center",padding:30,color:"#64748b"}}>Chưa có đánh giá nào.</div>
                  : reviews.map((c,i)=>(
                  <div key={c.evaluationId??c.id??i} className="rd-review-item">
                    <div className="rd-review-avatar" style={{width:40,height:40,borderRadius:"50%",background:"#3b82f6",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0}}>
                      {(c.userName??c.author??"K")[0].toUpperCase()}
                    </div>
                    <div className="rd-review-content">
                      <div className="rd-review-name">{c.userName??c.author??"Khách hàng"}</div>
                      <div className="rd-review-stars">
                        {[1,2,3,4,5].map(n=><StarFilled key={n} style={{fontSize:12,color:n<=(c.rating??5)?"#f59e0b":"#e2e8f0"}}/>)}
                        <span style={{fontSize:12,color:"#94a3b8",marginLeft:4}}>
                          {c.createdAt?new Date(c.createdAt).toLocaleDateString("vi-VN"):""}
                        </span>
                      </div>
                      <p className="rd-review-text">{c.comment??c.text??""}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="rd-booking-card">
          <div className="rd-price-block">
            {dayRate
              ? <><span className="rd-price">{fmt(dayRate.price)}</span><span className="rd-price-unit">{RENT_UNIT[dayRate.rentType]??""}</span></>
              : <span className="rd-price" style={{fontSize:"1rem"}}>Liên hệ để biết giá</span>}
          </div>
          {rates.length>0&&(
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
              {rates.map(r=>(
                <div key={r.roomRateId} style={{display:"flex",justifyContent:"space-between",
                  padding:"6px 10px",background:"#f0f4ff",borderRadius:8,fontSize:"0.84rem"}}>
                  <span style={{color:"#475569"}}>{RENT_LABEL[r.rentType]??r.rentType}</span>
                  <span style={{color:"#1e40af",fontWeight:700}}>{fmt(r.price)}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{
            marginBottom:14,padding:"8px 12px",borderRadius:8,fontSize:"0.84rem",textAlign:"center",
            background:(roomType.availableRooms??0)>0?"rgba(34,197,94,.08)":"rgba(239,68,68,.08)",
            color:(roomType.availableRooms??0)>0?"#166534":"#991b1b",
            border:`1px solid ${(roomType.availableRooms??0)>0?"rgba(34,197,94,.3)":"rgba(239,68,68,.3)"}`,
          }}>
            {(roomType.availableRooms??0)>0
              ? <>✓ Còn <strong>{roomType.availableRooms}</strong> phòng trống</>
              : <>✗ Hết phòng trống</>}
          </div>
          <button className="rd-book-btn"
            disabled={(roomType.availableRooms??0)<=0}
            style={(roomType.availableRooms??0)<=0?{opacity:0.5,cursor:"not-allowed"}:{}}
            onClick={()=>{ if(!isLoggedIn()){navigate("/");return;} navigate(`/checkout/${roomTypeId}`); }}>
            {(roomType.availableRooms??0)<=0?"Hết phòng":"Đặt phòng ngay"}
          </button>
          <p className="rd-book-note">Admin sẽ xác nhận và làm thủ tục check-in</p>
        </aside>
      </div>

      {/* Booking modal */}
      {showBooking&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,
          display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
          onClick={e=>{if(e.target===e.currentTarget&&!booking)resetBooking();}}>
          <div style={{background:"#fff",borderRadius:16,padding:28,width:"100%",maxWidth:460,boxShadow:"0 20px 60px rgba(0,0,0,0.25)"}}>
            {bookingDone ? (
              <div style={{textAlign:"center",padding:"12px 0"}}>
                <CheckCircleOutlined style={{fontSize:52,color:"#22c55e",display:"block",marginBottom:16}}/>
                <h3 style={{margin:"0 0 8px",color:"#166534",fontSize:"1.3rem"}}>Đặt phòng thành công!</h3>
                <p style={{color:"#475569",marginBottom:20}}>
                  Yêu cầu đã gửi. Admin sẽ xác nhận và thực hiện check-in cho bạn.
                </p>
                <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                  <button onClick={resetBooking} style={{padding:"10px 24px",borderRadius:10,background:"#f1f5f9",border:"none",cursor:"pointer",fontWeight:600,color:"#475569"}}>Đóng</button>
                  <button onClick={()=>{resetBooking();navigate("/booking-history");}} style={{padding:"10px 24px",borderRadius:10,background:"#3b82f6",border:"none",cursor:"pointer",fontWeight:600,color:"#fff"}}>Xem lịch sử đặt</button>
                </div>
              </div>
            ) : (<>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <h3 style={{margin:0,color:"#1e293b",fontSize:"1.15rem"}}>Đặt phòng — {roomType.name}</h3>
                <button onClick={resetBooking} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:18}}>✕</button>
              </div>

              {/* Rent type toggle */}
              <div style={{display:"flex",gap:8,marginBottom:18}}>
                {(dayRate||rates.some(r=>["Day","Night"].includes(r.rentType)))&&(
                  <button onClick={()=>setRentType("Day")} style={{
                    flex:1,padding:"10px 0",borderRadius:10,cursor:"pointer",fontWeight:600,
                    border:rentType==="Day"?"2px solid #3b82f6":"1px solid #e2e8f0",
                    background:rentType==="Day"?"#eff6ff":"#f8fafc",
                    color:rentType==="Day"?"#1d4ed8":"#64748b",
                  }}>
                    <CalendarOutlined style={{marginRight:6}}/>Theo ngày
                  </button>
                )}
                {hourRate&&(
                  <button onClick={()=>setRentType("Hour")} style={{
                    flex:1,padding:"10px 0",borderRadius:10,cursor:"pointer",fontWeight:600,
                    border:rentType==="Hour"?"2px solid #f59e0b":"1px solid #e2e8f0",
                    background:rentType==="Hour"?"#fffbeb":"#f8fafc",
                    color:rentType==="Hour"?"#b45309":"#64748b",
                  }}>
                    <ClockCircleOutlined style={{marginRight:6}}/>Theo giờ
                  </button>
                )}
              </div>

              {rentType==="Day" ? (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                  {[{label:"Ngày nhận phòng",val:fromDate,set:setFromDate,min:today},
                    {label:"Ngày trả phòng",val:toDate,set:setToDate,min:fromDate||today}].map(({label,val,set,min})=>(
                    <div key={label}>
                      <label style={{display:"block",fontSize:"0.8rem",color:"#64748b",marginBottom:4,fontWeight:600}}>{label}</label>
                      <input type="date" value={val} min={min} onChange={e=>set(e.target.value)}
                        style={{width:"100%",border:"1.5px solid #e2e8f0",borderRadius:8,padding:"8px 10px",fontSize:"0.9rem",boxSizing:"border-box"}}/>
                    </div>
                  ))}
                </div>
              ) : (<>
                <div style={{marginBottom:12}}>
                  <label style={{display:"block",fontSize:"0.8rem",color:"#64748b",marginBottom:4,fontWeight:600}}>Ngày thuê</label>
                  <input type="date" value={fromDate} min={today} onChange={e=>setFromDate(e.target.value)}
                    style={{width:"100%",border:"1.5px solid #e2e8f0",borderRadius:8,padding:"8px 10px",fontSize:"0.9rem",boxSizing:"border-box"}}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                  {[{label:"Giờ nhận phòng",val:fromHour,set:setFromHour},
                    {label:"Giờ trả phòng",val:toHour,set:setToHour}].map(({label,val,set})=>(
                    <div key={label}>
                      <label style={{display:"block",fontSize:"0.8rem",color:"#64748b",marginBottom:4,fontWeight:600}}>{label}</label>
                      <input type="time" value={val} onChange={e=>set(e.target.value)}
                        style={{width:"100%",border:"1.5px solid #e2e8f0",borderRadius:8,padding:"8px 10px",fontSize:"0.9rem",boxSizing:"border-box"}}/>
                    </div>
                  ))}
                </div>
              </>)}

              <div style={{marginBottom:14}}>
                <label style={{display:"block",fontSize:"0.8rem",color:"#64748b",marginBottom:4,fontWeight:600}}>Số khách</label>
                <select value={guests} onChange={e=>setGuests(Number(e.target.value))}
                  style={{width:"100%",border:"1.5px solid #e2e8f0",borderRadius:8,padding:"8px 10px",fontSize:"0.9rem",background:"#fff"}}>
                  {[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} khách</option>)}
                </select>
              </div>

              {selectedRate&&estimate>0&&(
                <div style={{background:"#f0f9ff",borderRadius:10,padding:"12px 16px",marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.85rem",color:"#475569",marginBottom:4}}>
                    <span>Đơn giá ({RENT_LABEL[selectedRate.rentType]})</span>
                    <span>{fmt(selectedRate.price)}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,color:"#1e40af"}}>
                    <span>Dự tính</span><span>{fmt(estimate)}</span>
                  </div>
                  <div style={{fontSize:"0.76rem",color:"#94a3b8",marginTop:4}}>* Giá thực tế xác nhận khi check-in</div>
                </div>
              )}

              {bookingErr&&(
                <div style={{background:"#fef2f2",border:"1px solid #fca5a5",color:"#991b1b",
                  borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:"0.88rem"}}>{bookingErr}</div>
              )}

              <button onClick={handleBook} disabled={booking} style={{
                width:"100%",padding:"12px 0",borderRadius:10,border:"none",cursor:booking?"not-allowed":"pointer",
                background:booking?"#93c5fd":"linear-gradient(135deg,#3b82f6,#6366f1)",
                color:"#fff",fontWeight:700,fontSize:"1rem",
              }}>
                {booking?<><LoadingOutlined style={{marginRight:6}}/>Đang xử lý...</>:"Xác nhận đặt phòng"}
              </button>
              <p style={{textAlign:"center",color:"#94a3b8",fontSize:"0.8rem",marginTop:8}}>
                Admin sẽ xác nhận và làm thủ tục check-in cho bạn
              </p>
            </>)}
          </div>
        </div>
      )}
      <Footer/>
    </div>
  );
}
