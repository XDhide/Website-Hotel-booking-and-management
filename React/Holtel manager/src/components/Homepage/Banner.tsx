import { useState, useEffect } from 'react'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { apiSearchRoomType } from '../../services/RoomTypeService'
import { API } from '../../constant/config'
import '../../assets/css/Homepage/Banner.css'

interface BannerSlide {
  imageUrl: string
  name: string
  description: string
}

const FALLBACK: BannerSlide[] = [
  { imageUrl: '', name: 'Chào mừng đến LuxStay',  description: 'Trải nghiệm lưu trú đẳng cấp 5 sao' },
  { imageUrl: '', name: 'Phòng View Biển',          description: 'Tận hưởng bình minh trên sóng nước' },
  { imageUrl: '', name: 'Không gian thư giãn',      description: 'Gói nghỉ dưỡng cao cấp đẳng cấp'   },
]

function resolveUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  
  const base = (API as string).replace('/api', '')
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function Banner() {
  const [slides, setSlides]   = useState<BannerSlide[]>(FALLBACK)
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded]   = useState(false)

  useEffect(() => {
    apiSearchRoomType(1, 20).then(res => {
      const items: any[] = res?.data ?? []
      const built: BannerSlide[] = items
        .filter(rt => rt.images && rt.images.length > 0)
        .map(rt => {
          const cover = rt.images.find((img: any) => img.displayOrder === 0) ?? rt.images[0]
          return {
            imageUrl:    resolveUrl(cover.imageUrl),
            name:        rt.name,
            description: rt.description || `Sức chứa: ${rt.capacity || '—'}`,
          }
        })
      if (built.length > 0) setSlides(built)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const id = setInterval(() => setCurrent(p => (p + 1) % slides.length), 4000)
    return () => clearInterval(id)
  }, [slides.length])

  useEffect(() => { setLoaded(false) }, [current])

  const prev = () => setCurrent(p => (p - 1 + slides.length) % slides.length)
  const next = () => setCurrent(p => (p + 1) % slides.length)
  const slide = slides[current]

  return (
    <div className="banner-wrap">
      
      {slide.imageUrl ? (
        <img
          key={slide.imageUrl}
          src={slide.imageUrl}
          alt={slide.name}
          className={`banner-bg-img${loaded ? ' loaded' : ''}`}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <div className="banner-bg-fallback" />
      )}

      
      <div className="banner-overlay" />

      
      <div className="banner-content">
        <div className="banner-title">{slide.name}</div>
        <div className="banner-sub">{slide.description}</div>
      </div>

      <button className="banner-arrow banner-arrow-left" onClick={prev}>
        <LeftOutlined />
      </button>
      <button className="banner-arrow banner-arrow-right" onClick={next}>
        <RightOutlined />
      </button>

      <div className="banner-dots">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            className={`banner-dot${i === current ? ' active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}
