import { useState } from 'react'
import { SearchOutlined, PlusOutlined ,DeleteOutlined } from '@ant-design/icons'
import Modal from './Modal'
import '../../assets/css/Adminpage/DataTable.css'


export type FieldMeta<T> = {
  label?: string
  render?: (value: any, row: T) => React.ReactNode
  inputType?: 'text' | 'select' | 'number' | 'email' | 'textarea'
  options?: string[]
  hidden?: boolean
  readOnly?: boolean
}

export type FieldsMeta<T> = Partial<Record<keyof T, FieldMeta<T>>>


interface DataTableProps<T extends { id: number }> {
  initialData: T[]
  fieldsMeta?: FieldsMeta<T>
  pageSize?: number
  emptyForm: Omit<T, 'id'>
}


export default function DataTable<T extends { id: number }>({
  initialData,
  fieldsMeta = {},
  pageSize = 5,
  emptyForm,
}: DataTableProps<T>) {

  const [data, setData]           = useState<T[]>(initialData)
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)
  const [editTarget, setEditTarget] = useState<T | null>(null)
  const [form, setForm]           = useState<Omit<T, 'id'>>(emptyForm)

  const allKeys = data.length > 0
    ? (Object.keys(data[0]) as (keyof T)[]).filter(k => k !== 'id')
    : (Object.keys(emptyForm) as (keyof T)[])

  const visibleKeys = allKeys.filter(k => !fieldsMeta[k]?.hidden)


  const filtered = data.filter(item =>
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)


  const openAdd = () => {
    setForm(emptyForm)
    setEditTarget(null)
    setModalMode('add')
  }

  const openEdit = (item: T) => {
    const { id, ...rest } = item as any
    setEditTarget(item)
    setForm(rest as Omit<T, 'id'>)
    setModalMode('edit')
  }


  const handleDelete = (id: number) =>
    setData(prev => prev.filter(item => item.id !== id))

  const handleSave = () => {
    const editableKeys = allKeys.filter(k => !fieldsMeta[k]?.readOnly)
    const hasEmpty = editableKeys.some(k => String((form as any)[k] ?? '').trim() === '')
    if (hasEmpty) return

    if (modalMode === 'add') {
      const newId = Math.max(0, ...data.map(item => item.id)) + 1
      setData(prev => [...prev, { id: newId, ...form } as unknown as T])
    } else if (modalMode === 'edit' && editTarget) {
      setData(prev =>
        prev.map(item =>
          item.id === editTarget.id ? { ...item, ...form } : item
        )
      )
    }
    setModalMode(null)
  }

  const handleFieldChange = (key: keyof T, value: string) => {
    setForm(f => ({ ...f, [key]: value }))
  }


  const renderFormField = (key: keyof T) => {
    const meta   = fieldsMeta[key]
    const value  = String((form as any)[key] ?? '')
    const type   = meta?.inputType ?? 'text'
    const label  = meta?.label ?? String(key)

    if (meta?.readOnly) return null 

    return (
      <div className="form-group" key={String(key)}>
        <label>{label}</label>

        {type === 'select' && meta?.options ? (
          <select value={value} onChange={e => handleFieldChange(key, e.target.value)}>
            {meta.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            value={value}
            onChange={e => handleFieldChange(key, e.target.value)}
            placeholder={`Nhập ${label.toLowerCase()}`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={e => handleFieldChange(key, e.target.value)}
            placeholder={`Nhập ${label.toLowerCase()}`}
          />
        )}
      </div>
    )
  }


  return (
    <div className="datatable-wrapper">

      <div className="datatable-header">
        <div className="search-box">
          <SearchOutlined className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <button className="btn-add" onClick={openAdd}>
          <PlusOutlined /> Thêm mới
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              {visibleKeys.map(key => (
                <th key={String(key)}>
                  {fieldsMeta[key]?.label ?? String(key)}
                </th>
              ))}
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={visibleKeys.length + 2}>Không có dữ liệu</td></tr>
            ) : paginated.map((row, i) => (
              <tr key={row.id} onClick={() => openEdit(row)}>
                <td>{(safePage - 1) * pageSize + i + 1}</td>

                {visibleKeys.map(key => (
                  <td key={String(key)}>
                    {fieldsMeta[key]?.render
                      ? fieldsMeta[key]!.render!(row[key], row)
                      : String(row[key] ?? '')}
                  </td>
                ))}

                <td onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleDelete(row.id)}><span className='btn-icon delete'><DeleteOutlined /></span></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span className="pagination-info">
          Hiển thị {paginated.length} / {filtered.length} bản ghi
        </span>
        <div className="pagination-controls">
          <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={safePage === p ? 'active' : ''} onClick={() => setPage(p)}>
              {p}
            </button>
          ))}
          <button disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>›</button>
        </div>
      </div>

      {/* Modal */}
      {modalMode && (
        <Modal
          title={modalMode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'}
          onClose={() => setModalMode(null)}
          onSave={handleSave}
        >
          {allKeys.map(key => renderFormField(key))}
        </Modal>
      )}

    </div>
  )
}