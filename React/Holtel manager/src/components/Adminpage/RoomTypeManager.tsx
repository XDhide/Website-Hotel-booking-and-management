import { useState, useEffect, useCallback, useRef } from 'react'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined,
  SearchOutlined, ReloadOutlined, LoadingOutlined, UploadOutlined,
  StarFilled, StarOutlined, CloseOutlined, CheckCircleOutlined,
} from '@ant-design/icons'
import { apiClient } from '../../constant/api'
import { API } from '../../constant/config'
import '../../assets/css/Adminpage/RoomTypeManager.css'

interface RoomImage { id: number; imageUrl: string; altText: string; displayOrder: number }
interface RoomType  { id: number; name: string; capacity: string; description: string; totalRooms: number; availableRooms: number; images: RoomImage[] }

const EMPTY_FORM = { name: '', capacity: '', description: '' }

export default function RoomTypeManager() {
  const [items,   setItems]   = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(0)
  const [search,  setSearch]  = useState('')
  const PAGE_SIZE = 10

  // ── Add/Edit modal state ──────────────────────────────────────────
  const [modalMode,  setModalMode]  = useState<'add' | 'edit' | null>(null)
  const [editTarget, setEditTarget] = useState<RoomType | null>(null)
  const [form,       setForm]       = useState({ ...EMPTY_FORM })
  const [saving,     setSaving]     = useState(false)
  const [formErr,    setFormErr]    = useState('')

  // Pending images khi thêm mới (chưa upload vì chưa có roomTypeId)
  const [pendingFiles,   setPendingFiles]   = useState<File[]>([])
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([])
  const [uploadingIdx,   setUploadingIdx]   = useState<number | null>(null)
  const addFileRef = useRef<HTMLInputElement>(null)

  // ── Image manager modal ──────────────────────────────────────────
  const [imgTarget, setImgTarget] = useState<RoomType | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imgErr,    setImgErr]    = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Load data ────────────────────────────────────────────────────
  const load = useCallback(async (p = page) => {
    setLoading(true)
    try {
      const res = await apiClient.get(`${API}/roomtype?page=${p}&limit=${PAGE_SIZE}`)
      const d = res.data
      setItems(d.data ?? [])
      setTotal(d.totalCount ?? 0)
    } catch { setItems([]) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { load(page) }, [page])

  const filtered = search
    ? items.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    : items

  // ── Add / Edit ───────────────────────────────────────────────────
  const openAdd = () => {
    setForm({ ...EMPTY_FORM })
    setPendingFiles([])
    setPendingPreviews([])
    setFormErr('')
    setModalMode('add')
  }

  const openEdit = (rt: RoomType) => {
    setEditTarget(rt)
    setForm({ name: rt.name, capacity: rt.capacity, description: rt.description })
    setPendingFiles([])
    setPendingPreviews([])
    setFormErr('')
    setModalMode('edit')
  }

  // Chọn ảnh trong form Add/Edit (chỉ preview, chưa upload)
  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setPendingFiles(prev => [...prev, ...files])
    files.forEach(f => {
      const url = URL.createObjectURL(f)
      setPendingPreviews(prev => [...prev, url])
    })
    if (addFileRef.current) addFileRef.current.value = ''
  }

  const removePending = (idx: number) => {
    URL.revokeObjectURL(pendingPreviews[idx])
    setPendingFiles(prev => prev.filter((_, i) => i !== idx))
    setPendingPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  // Upload một file lên server
  const uploadFile = async (roomTypeId: number, file: File, order: number) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('altText', file.name.replace(/\.[^.]+$/, ''))
    fd.append('displayOrder', String(order))
    await apiClient.post(
      `${API}/roomtype/${roomTypeId}/images/upload`, fd,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setFormErr('Vui lòng nhập tên loại phòng.'); return }
    setSaving(true); setFormErr('')
    try {
      let roomTypeId: number

      if (modalMode === 'add') {
        const res = await apiClient.post(`${API}/roomtype`, form)
        roomTypeId = res.data?.id ?? res.data?.Id
      } else {
        await apiClient.put(`${API}/roomtype/${editTarget!.id}`, form)
        roomTypeId = editTarget!.id
      }

      // Upload tất cả ảnh pending
      for (let i = 0; i < pendingFiles.length; i++) {
        setUploadingIdx(i)
        const existingCount = modalMode === 'edit' ? (editTarget?.images.length ?? 0) : 0
        await uploadFile(roomTypeId, pendingFiles[i], existingCount + i)
      }

      setUploadingIdx(null)
      setModalMode(null)
      load(page)
    } catch (e: any) {
      setFormErr(e?.response?.data ?? e?.message ?? 'Lưu thất bại.')
      setUploadingIdx(null)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xoá loại phòng này?')) return
    try { await apiClient.delete(`${API}/roomtype/${id}`); load(page) }
    catch { alert('Xoá thất bại.') }
  }

  // ── Image Manager ────────────────────────────────────────────────
  const openImages = (rt: RoomType) => { setImgTarget({ ...rt }); setImgErr('') }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !imgTarget) return
    setUploading(true); setImgErr('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('altText', file.name.replace(/\.[^.]+$/, ''))
      fd.append('displayOrder', String(imgTarget.images.length))
      const res = await apiClient.post(
        `${API}/roomtype/${imgTarget.id}/images/upload`, fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      const updated = { ...imgTarget, images: [...imgTarget.images, res.data] }
      setImgTarget(updated)
      setItems(prev => prev.map(r => r.id === updated.id ? updated : r))
    } catch (e: any) {
      setImgErr(e?.response?.data ?? 'Upload thất bại.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDeleteImg = async (imgId: number) => {
    if (!imgTarget) return
    try {
      await apiClient.delete(`${API}/roomtype/${imgTarget.id}/images/${imgId}`)
      const updated = { ...imgTarget, images: imgTarget.images.filter(i => i.id !== imgId) }
      setImgTarget(updated)
      setItems(prev => prev.map(r => r.id === updated.id ? updated : r))
    } catch { alert('Xoá ảnh thất bại.') }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="rtm-wrap">
      {/* ── Header ── */}
      <div className="rtm-header">
        <div className="rtm-header-left">
          <h2 className="rtm-title">Loại Phòng</h2>
          <span className="rtm-count">{total} loại phòng</span>
        </div>
        <div className="rtm-header-right">
          <div className="rtm-search">
            <SearchOutlined className="rtm-search-icon" />
            <input className="rtm-search-input" placeholder="Tìm kiếm..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="rtm-btn-icon" onClick={() => load(page)} title="Làm mới">
            <ReloadOutlined />
          </button>
          <button className="rtm-btn-add" onClick={openAdd}>
            <PlusOutlined /> Thêm loại phòng
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rtm-table-wrap">
        {loading ? (
          <div className="rtm-loading"><LoadingOutlined /> Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="rtm-empty">Không có dữ liệu</div>
        ) : (
          <table className="rtm-table">
            <thead>
              <tr>
                <th>#</th><th>Ảnh bìa</th><th>Tên loại phòng</th>
                <th>Sức chứa</th><th>Phòng trống</th><th>Ảnh</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rt, i) => {
                const cover = rt.images?.find(img => img.displayOrder === 0) ?? rt.images?.[0]
                return (
                  <tr key={rt.id}>
                    <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td>
                      {cover
                        ? <img src={cover.imageUrl} alt={cover.altText} className="rtm-thumb" />
                        : <div className="rtm-no-img"><PictureOutlined /></div>}
                    </td>
                    <td className="rtm-name">{rt.name}</td>
                    <td>{rt.capacity}</td>
                    <td>
                      <span className={`rtm-avail${(rt.availableRooms ?? 0) > 0 ? ' ok' : ' none'}`}>
                        {rt.availableRooms ?? 0}/{rt.totalRooms ?? 0}
                      </span>
                    </td>
                    <td>
                      <button className="rtm-img-btn" onClick={() => openImages(rt)}>
                        <PictureOutlined /> {rt.images?.length ?? 0} ảnh
                      </button>
                    </td>
                    <td>
                      <div className="rtm-actions">
                        <button className="rtm-act-btn edit" onClick={() => openEdit(rt)}><EditOutlined /></button>
                        <button className="rtm-act-btn del"  onClick={() => handleDelete(rt.id)}><DeleteOutlined /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="rtm-pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`rtm-page-btn${p === page ? ' active' : ''}`}
              onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalMode && (
        <div className="rtm-overlay" onClick={() => setModalMode(null)}>
          <div className="rtm-modal" onClick={e => e.stopPropagation()}>
            <div className="rtm-modal-header">
              <h3>{modalMode === 'add' ? 'Thêm loại phòng mới' : `Sửa: ${editTarget?.name}`}</h3>
              <button className="rtm-modal-close" onClick={() => setModalMode(null)}><CloseOutlined /></button>
            </div>
            <div className="rtm-modal-body">
              <label className="rtm-label">Tên loại phòng *</label>
              <input className="rtm-input" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="VD: Deluxe King" />

              <label className="rtm-label">Sức chứa</label>
              <input className="rtm-input" value={form.capacity}
                onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                placeholder="VD: 2 người lớn" />

              <label className="rtm-label">Mô tả</label>
              <textarea className="rtm-textarea" value={form.description} rows={3}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả chi tiết..." />

              {/* ── Ảnh ── */}
              <label className="rtm-label">
                Ảnh phòng {modalMode === 'add' ? '(sẽ upload sau khi tạo)' : ''}
              </label>

              {/* Preview pending */}
              {pendingPreviews.length > 0 && (
                <div className="rtm-pending-grid">
                  {pendingPreviews.map((src, idx) => (
                    <div key={idx} className="rtm-pending-item">
                      <img src={src} alt={`preview-${idx}`} className="rtm-pending-img" />
                      {idx === 0 && <span className="rtm-cover-badge"><StarFilled /> Ảnh bìa</span>}
                      {uploadingIdx === idx && (
                        <div className="rtm-pending-uploading"><LoadingOutlined /></div>
                      )}
                      {uploadingIdx === null && (
                        <button className="rtm-pending-remove" onClick={() => removePending(idx)}>
                          <CloseOutlined />
                        </button>
                      )}
                      {uploadingIdx !== null && uploadingIdx > idx && (
                        <div className="rtm-pending-done"><CheckCircleOutlined /></div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="rtm-upload-area" onClick={() => addFileRef.current?.click()}>
                <UploadOutlined /> Chọn ảnh (jpg, png, webp — tối đa 10MB mỗi ảnh)
              </div>
              <input ref={addFileRef} type="file" accept="image/*" multiple
                style={{ display: 'none' }} onChange={handleSelectFiles} />

              {pendingFiles.length > 0 && (
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: -8 }}>
                  {pendingFiles.length} ảnh đã chọn — sẽ upload khi nhấn Lưu
                </div>
              )}

              {formErr && <div className="rtm-err">{formErr}</div>}
            </div>
            <div className="rtm-modal-footer">
              <button className="rtm-btn-cancel" onClick={() => setModalMode(null)} disabled={saving}>Huỷ</button>
              <button className="rtm-btn-save" onClick={handleSave} disabled={saving}>
                {saving
                  ? uploadingIdx !== null
                    ? <><LoadingOutlined /> Đang upload ảnh {uploadingIdx + 1}/{pendingFiles.length}...</>
                    : <><LoadingOutlined /> Đang lưu...</>
                  : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Image Manager Modal ── */}
      {imgTarget && (
        <div className="rtm-overlay" onClick={() => setImgTarget(null)}>
          <div className="rtm-modal rtm-img-modal" onClick={e => e.stopPropagation()}>
            <div className="rtm-modal-header">
              <h3><PictureOutlined /> Ảnh — {imgTarget.name}</h3>
              <button className="rtm-modal-close" onClick={() => setImgTarget(null)}><CloseOutlined /></button>
            </div>
            <div className="rtm-modal-body">
              <div className="rtm-upload-area" onClick={() => fileRef.current?.click()}>
                {uploading
                  ? <><LoadingOutlined /> Đang upload...</>
                  : <><UploadOutlined /> Chọn ảnh để upload (jpg, png, webp — tối đa 10MB)</>}
              </div>
              <input ref={fileRef} type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handleUpload} />

              {imgErr && <div className="rtm-err">{imgErr}</div>}

              {imgTarget.images.length === 0 ? (
                <div className="rtm-no-images">Chưa có ảnh nào. Upload ảnh đầu tiên.</div>
              ) : (
                <div className="rtm-img-grid">
                  {imgTarget.images.map((img, idx) => (
                    <div key={img.id} className="rtm-img-item">
                      <img src={img.imageUrl} alt={img.altText} className="rtm-img-preview" />
                      <div className="rtm-img-overlay">
                        {idx === 0
                          ? <span className="rtm-img-cover-badge"><StarFilled /> Ảnh bìa</span>
                          : <span className="rtm-img-order-badge"><StarOutlined /> #{idx + 1}</span>}
                        <button className="rtm-img-del" onClick={() => handleDeleteImg(img.id)}>
                          <DeleteOutlined />
                        </button>
                      </div>
                      <div className="rtm-img-alt">{img.altText || `Ảnh ${idx + 1}`}</div>
                    </div>
                  ))}
                </div>
              )}
              <p className="rtm-img-note">Ảnh đầu tiên (displayOrder=0) là ảnh bìa hiển thị ngoài trang chủ.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
