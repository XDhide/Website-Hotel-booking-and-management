import { SearchOutlined, MoneyCollectOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useState } from "react";
import Modal from './Modal'
import '../../assets/css/Adminpage/Payment.css'

interface Bill {
    id: number
    room: string
    guestName: string
    checkIn: string
    checkOut: string
    price: number
    status: 'paid' | 'pending' | 'cancelled'
}

const mockBills: Bill[] = [
    { id: 1, room: "Phòng 101", guestName: "Nguyễn Văn A", checkIn: "01/06/2025", checkOut: "03/06/2025", price: 1200000, status: "paid" },
    { id: 2, room: "Phòng 102", guestName: "Trần Thị B", checkIn: "02/06/2025", checkOut: "05/06/2025", price: 900000, status: "pending" },
    { id: 3, room: "Phòng 201", guestName: "Lê Văn C", checkIn: "01/06/2025", checkOut: "04/06/2025", price: 1500000, status: "paid" },
    { id: 4, room: "Phòng 203", guestName: "Phạm Thị D", checkIn: "03/06/2025", checkOut: "06/06/2025", price: 600000, status: "cancelled" },
    { id: 5, room: "Phòng 104", guestName: "Hoàng Văn E", checkIn: "04/06/2025", checkOut: "07/06/2025", price: 1800000, status: "pending" },
    { id: 6, room: "Phòng 105", guestName: "Vũ Thị F", checkIn: "02/06/2025", checkOut: "03/06/2025", price: 450000, status: "paid" },
]

const statusLabel: Record<Bill['status'], string> = {
    paid: 'Đã thanh toán',
    pending: 'Chờ thanh toán',
    cancelled: 'Đã huỷ'
}

const statusIcon: Record<Bill['status'], React.ReactNode> = {
    paid: <CheckCircleOutlined />,
    pending: <ClockCircleOutlined />,
    cancelled: <CloseCircleOutlined />
}

export default function Payment() {
    const [search, setSearch] = useState('')
    const [bills, setBills] = useState<Bill[]>(mockBills)
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    const filtered = bills.filter(b =>
        b.guestName.toLowerCase().includes(search.toLowerCase()) ||
        b.room.toLowerCase().includes(search.toLowerCase())
    )

    const total = bills.reduce((s, b) => b.status === 'paid' ? s + b.price : s, 0)
    const pending = bills.filter(b => b.status === 'pending').length

    const openBill = (bill: Bill) => {
        setSelectedBill(bill)
        setModalOpen(true)
    }

    const handleMarkPaid = () => {
        if (!selectedBill) return
        setBills(prev => prev.map(b => b.id === selectedBill.id ? { ...b, status: 'paid' } : b))
        setModalOpen(false)
    }

    return (
        <div className="payment-wrapper">
            <div className="payment-stats">
                <div className="stat-card">
                    <div className="stat-label">Tổng thu</div>
                    <div className="stat-value green">{total.toLocaleString('vi-VN')}₫</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Chờ thanh toán</div>
                    <div className="stat-value yellow">{pending} hoá đơn</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Tổng hoá đơn</div>
                    <div className="stat-value">{bills.length}</div>
                </div>
            </div>

            <div className="payment-header">
                <div className="search-box">
                    <SearchOutlined className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tên khách, phòng..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="payment-table-wrapper">
                <table className="payment-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Phòng</th>
                            <th>Khách hàng</th>
                            <th>Nhận phòng</th>
                            <th>Trả phòng</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.35)' }}>Không có dữ liệu</td></tr>
                        ) : filtered.map((bill, i) => (
                            <tr key={bill.id} onClick={() => openBill(bill)} className="payment-row">
                                <td>{i + 1}</td>
                                <td>{bill.room}</td>
                                <td>{bill.guestName}</td>
                                <td>{bill.checkIn}</td>
                                <td>{bill.checkOut}</td>
                                <td className="price-cell">{bill.price.toLocaleString('vi-VN')}₫</td>
                                <td>
                                    <span className={`status-badge status-${bill.status}`}>
                                        {statusIcon[bill.status]} {statusLabel[bill.status]}
                                    </span>
                                </td>
                                <td onClick={e => e.stopPropagation()}>
                                    <button className="pay-action-btn" onClick={() => openBill(bill)}>
                                        <MoneyCollectOutlined /> Chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && selectedBill && (
                <Modal
                    title="Chi tiết hoá đơn"
                    onClose={() => { setModalOpen(false); setSelectedBill(null) }}
                    onSave={handleMarkPaid}
                >
                    <div className="bill-detail">
                        <div className="bill-row"><span>Mã hoá đơn:</span><span>#{selectedBill.id}</span></div>
                        <div className="bill-row"><span>Phòng:</span><span>{selectedBill.room}</span></div>
                        <div className="bill-row"><span>Khách hàng:</span><span>{selectedBill.guestName}</span></div>
                        <div className="bill-row"><span>Nhận phòng:</span><span>{selectedBill.checkIn}</span></div>
                        <div className="bill-row"><span>Trả phòng:</span><span>{selectedBill.checkOut}</span></div>
                        <div className="bill-row highlight"><span>Tổng tiền:</span><span>{selectedBill.price.toLocaleString('vi-VN')}₫</span></div>
                        <div className="bill-row"><span>Trạng thái:</span>
                            <span className={`status-badge status-${selectedBill.status}`}>
                                {statusLabel[selectedBill.status]}
                            </span>
                        </div>
                        {selectedBill.status === 'pending' && (
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '8px' }}>
                                Nhấn "Lưu" để xác nhận đã thanh toán.
                            </p>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    )
}