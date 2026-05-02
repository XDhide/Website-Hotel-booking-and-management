import { useState, useEffect, useCallback } from 'react'
import {
  PlusOutlined, SearchOutlined, ReloadOutlined, LoadingOutlined,
  CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined,
  HomeOutlined, CheckOutlined, LoginOutlined, TagOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import Modal from './Modal'
import { apiClient } from '../../constant/api'
import { API } from '../../constant/config'

/* ── Types ── */
interface Booking {
  id: number; userId: string; roomTypeId: number; roomTypeName?: string
  fromDate: string; toDate: string; status: string; createdAt: string
  deposit?: number; roomNumber?: string
}
interface Invoice {
  invoiceId: number; roomUseId: number; subTotal: number
  discountAmount: number; surchargeAmount: number; finalAmount: number
  paymentStatus: string; paymentMethod: string; note?: string
}
interface RoomTypeItem {
  id: number; name: string; capacity: string; availableRooms: number; totalRooms: number
  images: { imageUrl: string }[]
}
interface Service { id: number; name: string; serviceType: string; price: number; unit: string }

const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(v??0)
const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString('vi-VN') : '—'

function getCurrentUserId(): string {
  try {
    const token = localStorage.getItem('hotel_token')??''
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload?.sub??payload?.nameid??payload?.userId??''
  } catch { return '' }
}

type Step = 'main' | 'pickRoom' | 'booking'

const BOOKING_STATUS_COLOR: Record<string,string> = {
  Pending: '#f59e0b', Confirmed: '#3b82f6', CheckedIn: '#22c55e',
  CheckedOut: '#6b7280', Cancelled: '#ef4444',
}
const BOOKING_STATUS_LABEL: Record<string,string> = {
  Pending: 'Chờ xác nhận', Confirmed: 'Đã xác nhận', CheckedIn: 'Đang ở',
  CheckedOut: 'Đã trả phòng', Cancelled: 'Đã hủy',
}

export default function HomeAdmin() {
  /* Bookings list */
  const [bookings,    setBookings]    = useState<Booking[]>([])
  const [loadingBk,   setLoadingBk]   = useState(true)
  const [bkSearch,    setBkSearch]    = useState('')
  const [bkPage,      setBkPage]      = useState(1)
  const [bkTotalPg,   setBkTotalPg]   = useState(1)
  const [bkTab,       setBkTab]       = useState<'pending'|'active'|'all'>('pending')

  /* Invoices unpaid */
  const [invoices,    setInvoices]    = useState<Invoice[]>([])
  const [loadingInv,  setLoadingInv]  = useState(true)
  const [invSearch,   setInvSearch]   = useState('')

  /* Catalog */
  const [roomTypes,  setRoomTypes]  = useState<RoomTypeItem[]>([])
  const [services,   setServices]   = useState<Service[]>([])
  const [loadingCat, setLoadingCat] = useState(true)

  /* Wizard state */
  const [step,         setStep]        = useState<Step>('main')
  const [selectedRT,   setSelectedRT]  = useState<RoomTypeItem|null>(null)
  const [checkIn,      setCheckIn]     = useState('')
  const [checkOut,     setCheckOut]    = useState('')
  const [guests,       setGuests]      = useState(1)
  const [saving,       setSaving]      = useState(false)
  const [rtSearch,     setRtSearch]    = useState('')
  const [toast,        setToast]       = useState<{msg:string;ok:boolean}|null>(null)

  /* CheckIn modal */
  const [checkInBk,    setCheckInBk]   = useState<Booking|null>(null)
  const [doingCheckIn, setDoingCheckIn] = useState(false)

  const showToast = (msg: string, ok=true) => {
    setToast({msg,ok}); setTimeout(()=>setToast(null),3500)
  }
  const today = new Date().toISOString().split('T')[0]

  const loadBookings = useCallback(async (p: number) => {
    setLoadingBk(true)
    try {
      const res = await apiClient.get(`${API}/booking?page=${p}&limit=15`)
      const raw = res.data
      const items: Booking[] = Array.isArray(raw)?raw:raw?.data??[]
      setBookings(items)
      setBkTotalPg(raw?.totalPages??1)
    } catch { setBookings([]) }
    finally { setLoadingBk(false) }
  },[])

  const loadInvoices = useCallback(async () => {
    setLoadingInv(true)
    try {
      const res = await apiClient.get(`${API}/invoice?page=1&limit=50`)
      const raw = res.data
      const all: Invoice[] = Array.isArray(raw)?raw:raw?.data??[]
      setInvoices(all.filter(i=>i.paymentStatus==='Unpaid'))
    } catch { setInvoices([]) }
    finally { setLoadingInv(false) }
  },[])

  const loadCatalog = useCallback(async () => {
    setLoadingCat(true)
    try {
      const [rtRes,sRes] = await Promise.all([
        apiClient.get(`${API}/roomtype?page=1&limit=100`),
        apiClient.get(`${API}/services?page=1&limit=100`),
      ])
      const norm = (r:any) => Array.isArray(r.data)?r.data:r.data?.data??[]
      setRoomTypes(norm(rtRes).map((rt:any)=>({
        id:             rt.id??rt.Id,
        name:           rt.name??rt.Name,
        capacity:       rt.capacity??'',
        availableRooms: rt.availableRooms??0,
        totalRooms:     rt.totalRooms??0,
        images:         rt.images??[],
      })))
      setServices(norm(sRes))
    } catch {}
    finally { setLoadingCat(false) }
  },[])

  useEffect(()=>{ loadBookings(bkPage) },[loadBookings,bkPage])
  useEffect(()=>{ loadInvoices() },[loadInvoices])
  useEffect(()=>{ loadCatalog() },[loadCatalog])

  /* ── Tạo booking (admin) ── */
  const handleCreateBooking = async () => {
    if (!selectedRT) { showToast('Vui lòng chọn loại phòng',false); return }
    if (!checkIn)    { showToast('Vui lòng chọn ngày nhận phòng',false); return }
    if (!checkOut)   { showToast('Vui lòng chọn ngày trả phòng',false); return }
    if (new Date(checkOut)<=new Date(checkIn)) { showToast('Ngày trả phòng phải sau ngày nhận phòng',false); return }
    setSaving(true)
    try {
      const userId = getCurrentUserId()
      const bRes = await apiClient.post(`${API}/booking/admin-create`,{
        userId, roomTypeId:selectedRT.id, deposit:0,
        fromDate:checkIn, toDate:checkOut, status:'Pending',
        createdAt:new Date().toISOString(),
      })
      const bId:number = bRes.data?.id??bRes.data?.Id??0
      showToast(`✓ Booking #${bId} đã tạo! Chọn booking và nhấn Check-in để xác nhận khách vào phòng.`)
      resetWizard()
      await loadBookings(1)
      await loadCatalog()
    } catch(e:any) {
      showToast(e?.response?.data||'Tạo booking thất bại',false)
    } finally { setSaving(false) }
  }

  /* ── Check-in: tạo RoomInUse + Invoice ── */
  const handleCheckIn = async () => {
    if (!checkInBk) return
    setDoingCheckIn(true)
    try {
      await apiClient.post(`${API}/CheckInOut/checkin`,{ bookingId: checkInBk.id })
      showToast(`✓ Check-in booking #${checkInBk.id} thành công! Hóa đơn đã được tạo.`)
      setCheckInBk(null)
      await loadBookings(bkPage)
      await loadInvoices()
    } catch(e:any) {
      showToast(e?.response?.data||'Check-in thất bại',false)
    } finally { setDoingCheckIn(false) }
  }

  const resetWizard = () => {
    setStep('main'); setSelectedRT(null); setCheckIn(''); setCheckOut(''); setGuests(1); setRtSearch('')
  }

  const availableRTs = roomTypes.filter(rt=>rt.availableRooms>0&&rt.name.toLowerCase().includes(rtSearch.toLowerCase()))

  const filteredBk = bookings.filter(b => {
    const matchTab = bkTab==='all' ||
      (bkTab==='pending' && ['Pending','Confirmed'].includes(b.status)) ||
      (bkTab==='active'  && b.status==='CheckedIn')
    const q = bkSearch.toLowerCase()
    const matchSearch = !q || String(b.id).includes(q) || (b.roomTypeName??'').toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  const filteredInv = invoices.filter(inv =>
    String(inv.roomUseId).includes(invSearch)||String(inv.invoiceId).includes(invSearch))

  const pendingCount = bookings.filter(b=>['Pending','Confirmed'].includes(b.status)).length
  const activeCount  = bookings.filter(b=>b.status==='CheckedIn').length

  return (
    <div style={{padding:'0 0 40px'}}>
      {toast&&(
        <div style={{
          position:'fixed',top:20,right:20,zIndex:9999,padding:'12px 20px',
          borderRadius:10,fontWeight:600,fontSize:'0.9rem',
          background:toast.ok?'#166534':'#7f1d1d',color:'#fff',
          boxShadow:'0 8px 32px rgba(0,0,0,0.4)',maxWidth:420,
        }}>{toast.msg}</div>
      )}

      {/* Stats */}
      <div style={{display:'flex',gap:16,marginBottom:24,flexWrap:'wrap'}}>
        {[
          {label:'Booking chờ xác nhận',val:pendingCount,   color:'#f59e0b',icon:<ClockCircleOutlined/>},
          {label:'Đang ở',              val:activeCount,    color:'#22c55e',icon:<CheckCircleOutlined/>},
          {label:'Hoá đơn chưa TT',    val:invoices.length,color:'#ef4444',icon:<FileTextOutlined/>},
        ].map(s=>(
          <div key={s.label} style={{flex:1,minWidth:140,background:'rgba(255,255,255,0.04)',
            border:`1px solid ${s.color}33`,borderRadius:12,padding:'14px 18px'}}>
            <div style={{color:s.color,fontSize:'1.5rem',fontWeight:700}}>{s.val}</div>
            <div style={{color:'rgba(255,255,255,0.5)',fontSize:'0.8rem',marginTop:2}}>{s.icon} {s.label}</div>
          </div>
        ))}
        <button onClick={()=>setStep('pickRoom')} style={{
          background:'linear-gradient(135deg,#3b82f6,#6366f1)',color:'#fff',
          border:'none',borderRadius:12,padding:'14px 24px',cursor:'pointer',
          fontWeight:700,fontSize:'0.95rem',display:'flex',alignItems:'center',gap:8,whiteSpace:'nowrap',
        }}>
          <PlusOutlined/> Tạo Booking mới
        </button>
      </div>

      {/* Bookings Table */}
      <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,overflow:'hidden',marginBottom:28}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
          <span style={{color:'#fff',fontWeight:700,fontSize:'1rem'}}><HomeOutlined/> Quản lý Booking</span>
          <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
            {/* Tabs */}
            {(['pending','active','all'] as const).map(t=>(
              <button key={t} onClick={()=>setBkTab(t)} style={{
                padding:'5px 12px',borderRadius:8,cursor:'pointer',fontSize:'0.82rem',fontWeight:600,
                border:`1px solid ${bkTab===t?'#3b82f6':'rgba(255,255,255,0.1)'}`,
                background:bkTab===t?'rgba(59,130,246,0.2)':'rgba(255,255,255,0.03)',
                color:bkTab===t?'#60a5fa':'rgba(255,255,255,0.5)',
              }}>{t==='pending'?'Chờ xác nhận':t==='active'?'Đang ở':'Tất cả'}</button>
            ))}
            <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.05)',borderRadius:8,padding:'5px 10px'}}>
              <SearchOutlined style={{color:'rgba(255,255,255,0.4)'}}/>
              <input value={bkSearch} onChange={e=>setBkSearch(e.target.value)} placeholder="Tìm ID / loại phòng..."
                style={{background:'none',border:'none',color:'#fff',outline:'none',width:140,fontSize:'0.85rem'}}/>
            </div>
            <button onClick={()=>loadBookings(bkPage)} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',borderRadius:8,padding:'5px 10px',cursor:'pointer'}}>
              <ReloadOutlined/>
            </button>
          </div>
        </div>

        {loadingBk ? (
          <div style={{padding:40,textAlign:'center',color:'rgba(255,255,255,0.3)'}}><LoadingOutlined/> Đang tải...</div>
        ) : filteredBk.length===0 ? (
          <div style={{padding:40,textAlign:'center',color:'rgba(255,255,255,0.3)'}}>Không có booking nào</div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.86rem'}}>
              <thead>
                <tr style={{background:'rgba(255,255,255,0.03)'}}>
                  {['#ID','Loại phòng','Từ ngày','Đến ngày','Trạng thái','Hành động'].map(h=>(
                    <th key={h} style={{padding:'10px 14px',color:'rgba(255,255,255,0.5)',fontWeight:600,textAlign:'left',fontSize:'0.79rem'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBk.map(bk=>(
                  <tr key={bk.id} style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                    <td style={{padding:'11px 14px',color:'#94a3b8',fontWeight:600}}>#{bk.id}</td>
                    <td style={{padding:'11px 14px',color:'#fff'}}>{bk.roomTypeName??`Loại #${bk.roomTypeId}`}</td>
                    <td style={{padding:'11px 14px',color:'rgba(255,255,255,0.7)'}}>{fmtDate(bk.fromDate)}</td>
                    <td style={{padding:'11px 14px',color:'rgba(255,255,255,0.7)'}}>{fmtDate(bk.toDate)}</td>
                    <td style={{padding:'11px 14px'}}>
                      <span style={{
                        padding:'3px 10px',borderRadius:20,fontSize:'0.75rem',fontWeight:700,
                        background:`${BOOKING_STATUS_COLOR[bk.status]??'#6b7280'}22`,
                        color:BOOKING_STATUS_COLOR[bk.status]??'#9ca3af',
                        border:`1px solid ${BOOKING_STATUS_COLOR[bk.status]??'#6b7280'}44`,
                      }}>{BOOKING_STATUS_LABEL[bk.status]??bk.status}</span>
                    </td>
                    <td style={{padding:'11px 14px'}}>
                      {['Pending','Confirmed'].includes(bk.status) && (
                        <button onClick={()=>setCheckInBk(bk)} style={{
                          background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.3)',
                          color:'#4ade80',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontSize:'0.8rem',fontWeight:600,
                          display:'flex',alignItems:'center',gap:5,
                        }}>
                          <LoginOutlined/> Check-in
                        </button>
                      )}
                      {bk.status==='CheckedIn' && (
                        <span style={{color:'rgba(255,255,255,0.3)',fontSize:'0.8rem'}}>Đang ở</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {bkTotalPg>1&&(
          <div style={{padding:'10px 18px',display:'flex',justifyContent:'flex-end',gap:6,borderTop:'1px solid rgba(255,255,255,0.07)'}}>
            {Array.from({length:bkTotalPg},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setBkPage(p)} style={{
                background:p===bkPage?'#3b82f6':'rgba(255,255,255,0.05)',
                border:'1px solid rgba(255,255,255,0.1)',color:'#fff',
                borderRadius:6,padding:'4px 10px',cursor:'pointer',
              }}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Invoices unpaid */}
      <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{color:'#fff',fontWeight:700,fontSize:'1rem'}}><FileTextOutlined/> Hoá đơn chưa thanh toán</span>
          <div style={{display:'flex',gap:8}}>
            <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.05)',borderRadius:8,padding:'6px 12px'}}>
              <SearchOutlined style={{color:'rgba(255,255,255,0.4)'}}/>
              <input value={invSearch} onChange={e=>setInvSearch(e.target.value)} placeholder="Tìm ID..."
                style={{background:'none',border:'none',color:'#fff',outline:'none',width:100,fontSize:'0.88rem'}}/>
            </div>
            <button onClick={loadInvoices} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#fff',borderRadius:8,padding:'6px 12px',cursor:'pointer'}}>
              <ReloadOutlined/>
            </button>
          </div>
        </div>
        {loadingInv ? (
          <div style={{padding:40,textAlign:'center',color:'rgba(255,255,255,0.3)'}}><LoadingOutlined/> Đang tải...</div>
        ) : filteredInv.length===0 ? (
          <div style={{padding:40,textAlign:'center',color:'rgba(255,255,255,0.3)'}}>
            <CheckCircleOutlined style={{fontSize:24,marginBottom:8,display:'block'}}/> Không có hoá đơn chưa thanh toán
          </div>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.88rem'}}>
            <thead>
              <tr style={{background:'rgba(255,255,255,0.03)'}}>
                {['Mã HĐ','Tạm tính','Phụ thu','Giảm giá','Tổng tiền',''].map(h=>(
                  <th key={h} style={{padding:'10px 16px',color:'rgba(255,255,255,0.5)',fontWeight:600,textAlign:'left',fontSize:'0.8rem'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredInv.map(inv=>(
                <tr key={inv.invoiceId} style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                  <td style={{padding:'12px 16px',color:'#fff',fontWeight:600}}>#{inv.invoiceId}</td>
                  <td style={{padding:'12px 16px',color:'#fff'}}>{fmt(inv.subTotal??0)}</td>
                  <td style={{padding:'12px 16px',color:'#fff'}}>{inv.surchargeAmount?fmt(inv.surchargeAmount):'—'}</td>
                  <td style={{padding:'12px 16px',color:'#22c55e'}}>{inv.discountAmount?`-${fmt(inv.discountAmount)}`:'—'}</td>
                  <td style={{padding:'12px 16px',color:'#fff',fontWeight:700}}>{fmt(inv.finalAmount??0)}</td>
                  <td style={{padding:'12px 16px'}}>
                    <span style={{color:'rgba(255,255,255,0.4)',fontSize:'0.8rem'}}>→ Trang Hoá đơn</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Wizard: chọn loại phòng ── */}
      {step==='pickRoom'&&(
        <Modal title="Chọn loại phòng" onClose={resetWizard} onSave={()=>selectedRT&&setStep('booking')}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.05)',borderRadius:8,padding:'8px 12px'}}>
              <SearchOutlined style={{color:'rgba(255,255,255,0.4)'}}/>
              <input value={rtSearch} onChange={e=>setRtSearch(e.target.value)} placeholder="Tìm loại phòng..."
                style={{background:'none',border:'none',color:'#fff',outline:'none',flex:1,fontSize:'0.88rem'}}/>
            </div>
            {loadingCat ? (
              <div style={{textAlign:'center',padding:30,color:'rgba(255,255,255,0.4)'}}><LoadingOutlined/> Đang tải...</div>
            ) : availableRTs.length===0 ? (
              <div style={{textAlign:'center',padding:30,color:'rgba(255,255,255,0.4)'}}>
                <HomeOutlined style={{fontSize:28,display:'block',marginBottom:8}}/>Không có loại phòng nào còn trống
              </div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:10,maxHeight:340,overflowY:'auto'}}>
                {availableRTs.map(rt=>{
                  const cover=rt.images?.[0]?.imageUrl
                  const isSelected=selectedRT?.id===rt.id
                  return (
                    <div key={rt.id} onClick={()=>setSelectedRT(rt)} style={{
                      borderRadius:10,overflow:'hidden',cursor:'pointer',
                      border:`2px solid ${isSelected?'#3b82f6':'rgba(255,255,255,0.08)'}`,
                      background:isSelected?'rgba(59,130,246,0.1)':'rgba(255,255,255,0.03)',
                    }}>
                      {cover
                        ? <img src={cover} alt={rt.name} style={{width:'100%',height:72,objectFit:'cover',display:'block'}}/>
                        : <div style={{width:'100%',height:72,background:'rgba(255,255,255,0.05)',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.2)',fontSize:22}}><HomeOutlined/></div>
                      }
                      <div style={{padding:'8px 10px'}}>
                        <div style={{fontWeight:700,color:'#fff',fontSize:'0.85rem',marginBottom:3}}>{rt.name}</div>
                        <div style={{fontSize:'0.72rem',color:'#94a3b8'}}>{rt.capacity}</div>
                        <div style={{fontSize:'0.72rem',color:'#22c55e',marginTop:3}}>
                          <span style={{display:'inline-block',width:7,height:7,borderRadius:'50%',background:'#22c55e',marginRight:4}}/>
                          {rt.availableRooms} phòng trống
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {selectedRT&&(
              <div style={{marginTop:8,padding:'8px 12px',background:'rgba(59,130,246,0.08)',borderRadius:8,color:'#60a5fa',fontSize:'0.85rem'}}>
                <CheckOutlined style={{marginRight:6}}/>Đã chọn: {selectedRT.name} ({selectedRT.availableRooms} phòng trống)
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Wizard: nhập ngày ── */}
      {step==='booking'&&selectedRT&&(
        <Modal title={`Booking — ${selectedRT.name}`} onClose={resetWizard} onSave={handleCreateBooking}>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{background:'rgba(59,130,246,0.08)',borderRadius:8,padding:'8px 12px',fontSize:'0.85rem',color:'#60a5fa'}}>
              <HomeOutlined style={{marginRight:6}}/>{selectedRT.name} — {selectedRT.availableRooms} phòng trống
            </div>
            <div style={{background:'rgba(251,191,36,0.08)',borderRadius:8,padding:'8px 12px',fontSize:'0.82rem',color:'#fbbf24'}}>
              ℹ️ Sau khi tạo booking, vào danh sách booking và nhấn <strong>Check-in</strong> để xác nhận khách vào phòng và tạo hóa đơn.
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[
                {lbl:'Ngày nhận phòng',val:checkIn,set:setCheckIn},
                {lbl:'Ngày trả phòng', val:checkOut,set:setCheckOut},
              ].map(({lbl,val,set}:any)=>(
                <div key={lbl} className="form-group">
                  <label>{lbl}</label>
                  <input type="date" value={val} min={today} onChange={e=>set(e.target.value)}/>
                </div>
              ))}
            </div>
            <div className="form-group">
              <label>Số khách</label>
              <input type="number" min={1} max={10} value={guests} onChange={e=>setGuests(Number(e.target.value))}/>
            </div>
            {saving&&(
              <div style={{textAlign:'center',color:'rgba(255,255,255,0.5)',fontSize:'0.85rem'}}>
                <LoadingOutlined style={{marginRight:6}}/>Đang tạo booking...
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Check-in modal ── */}
      {checkInBk&&(
        <Modal title={`Check-in Booking #${checkInBk.id}`} onClose={()=>setCheckInBk(null)} onSave={handleCheckIn}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{background:'rgba(34,197,94,0.08)',borderRadius:10,padding:'14px 16px',border:'1px solid rgba(34,197,94,0.2)'}}>
              <p style={{color:'#4ade80',fontWeight:700,margin:'0 0 8px',fontSize:'0.95rem'}}>
                <LoginOutlined style={{marginRight:8}}/>Xác nhận Check-in
              </p>
              <p style={{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem',margin:0}}>
                Khi nhấn <strong>Xác nhận</strong>, hệ thống sẽ:
              </p>
              <ul style={{color:'rgba(255,255,255,0.6)',fontSize:'0.84rem',margin:'8px 0 0',paddingLeft:18}}>
                <li>Gán phòng trống cho booking</li>
                <li>Tạo hóa đơn (chưa thanh toán)</li>
                <li>Cập nhật trạng thái → Đang ở</li>
              </ul>
            </div>
            {[
              ['Booking ID', `#${checkInBk.id}`],
              ['Loại phòng', checkInBk.roomTypeName??`Loại #${checkInBk.roomTypeId}`],
              ['Từ ngày',    fmtDate(checkInBk.fromDate)],
              ['Đến ngày',   fmtDate(checkInBk.toDate)],
            ].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <span style={{color:'rgba(255,255,255,0.5)',fontSize:'0.88rem'}}>{l}</span>
                <span style={{color:'#fff',fontWeight:500}}>{v}</span>
              </div>
            ))}
            {doingCheckIn&&(
              <div style={{textAlign:'center',color:'rgba(255,255,255,0.5)'}}><LoadingOutlined style={{marginRight:6}}/>Đang xử lý check-in...</div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
