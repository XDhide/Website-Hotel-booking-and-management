import { useState } from 'react'
import { SearchOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import Modal from './Modal'
import './DataTable.css'

export interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'Hoạt động' | 'Không hoạt động'
}

const INITIAL_DATA: User[] = [
  { id: 1,  name: 'Nguyễn Văn An',    email: 'an@example.com',     role: 'Admin',  status: 'Hoạt động'       },
  { id: 2,  name: 'Trần Thị Bình',    email: 'binh@example.com',   role: 'Editor', status: 'Hoạt động'       },
  { id: 3,  name: 'Lê Minh Cường',    email: 'cuong@example.com',  role: 'Viewer', status: 'Không hoạt động' },
  { id: 4,  name: 'Phạm Thu Dung',    email: 'dung@example.com',   role: 'Editor', status: 'Hoạt động'       },
  { id: 5,  name: 'Hoàng Văn Em',     email: 'em@example.com',     role: 'Viewer', status: 'Hoạt động'       },
  { id: 6,  name: 'Vũ Thị Phương',    email: 'phuong@example.com', role: 'Admin',  status: 'Không hoạt động' },
  { id: 7,  name: 'Đặng Quốc Giang',  email: 'giang@example.com',  role: 'Viewer', status: 'Hoạt động'       },
  { id: 8,  name: 'Bùi Thị Hoa',      email: 'hoa@example.com',    role: 'Editor', status: 'Hoạt động'       },
  { id: 9,  name: 'Đinh Văn Hùng',    email: 'hung@example.com',   role: 'Viewer', status: 'Không hoạt động' },
  { id: 10, name: 'Lý Thị Lan',       email: 'lan@example.com',    role: 'Editor', status: 'Hoạt động'       },
  { id: 11, name: 'Mai Văn Long',      email: 'long@example.com',   role: 'Viewer', status: 'Hoạt động'       },
  { id: 12, name: 'Phan Thị Mai',      email: 'mai@example.com',    role: 'Admin',  status: 'Hoạt động'       },
]

const PAGE_SIZE = 5
const EMPTY: Omit<User, 'id'> = { name: '', email: '', role: 'Viewer', status: 'Hoạt động' }

export default function DataTable() {
  const [data, setData]           = useState<User[]>(INITIAL_DATA)
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [form, setForm]           = useState<Omit<User, 'id'>>(EMPTY)

  const filtered = data.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const openAdd = () => {
    setForm(EMPTY)
    setEditTarget(null)
    setModalMode('add')
  }

  const openEdit = (user: User) => {
    setForm({ name: user.name, email: user.email, role: user.role, status: user.status })
    setEditTarget(user)
    setModalMode('edit')
  }

  const handleDelete = (id: number) => setData(prev => prev.filter(u => u.id !== id))

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return
    if (modalMode === 'add') {
      const newId = Math.max(0, ...data.map(u => u.id)) + 1
      setData(prev => [...prev, { id: newId, ...form }])
    } else if (modalMode === 'edit' && editTarget) {
      setData(prev => prev.map(u => u.id === editTarget.id ? { ...u, ...form } : u))
    }
    setModalMode(null)
  }

  return (
    <div className="datatable-wrapper">
      {/* Thanh tìm kiếm + nút thêm */}
      <div className="datatable-header">
        <div className="search-box">
          <SearchOutlined className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, vai trò..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <button className="btn-add" onClick={openAdd}>
          <PlusOutlined /> Thêm mới
        </button>
      </div>

      {/* Bảng dữ liệu */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={6} className="no-data">Không có dữ liệu</td></tr>
            ) : paginated.map((user, i) => (
              <tr key={user.id} className="table-row" onClick={() => openEdit(user)}>
                <td>{(safePage - 1) * PAGE_SIZE + i + 1}</td>
                <td className="cell-name">{user.name}</td>
                <td className="cell-email">{user.email}</td>
                <td><span className={`badge role-${user.role.toLowerCase()}`}>{user.role}</span></td>
                <td><span className={`badge status-${user.status === 'Hoạt động' ? 'active' : 'inactive'}`}>{user.status}</span></td>
                <td onClick={e => e.stopPropagation()}>
                  <div className="action-group">
                    <button className="btn-icon edit" title="Sửa" onClick={() => openEdit(user)}>
                      <EditOutlined />
                    </button>
                    <button className="btn-icon delete" title="Xóa" onClick={() => handleDelete(user.id)}>
                      <DeleteOutlined />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
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

      {/* Modal thêm / sửa */}
      {modalMode && (
        <Modal
          title={modalMode === 'add' ? 'Thêm người dùng' : 'Sửa người dùng'}
          onClose={() => setModalMode(null)}
          onSave={handleSave}
        >
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nhập họ tên"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="Nhập email"
            />
          </div>
          <div className="form-group">
            <label>Vai trò</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option>Admin</option>
              <option>Editor</option>
              <option>Viewer</option>
            </select>
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as User['status'] }))}
            >
              <option>Hoạt động</option>
              <option>Không hoạt động</option>
            </select>
          </div>
        </Modal>
      )}
    </div>
  )
}
