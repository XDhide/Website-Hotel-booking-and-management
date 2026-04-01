import { useState } from 'react'
import {
    BarChartOutlined,
    RiseOutlined,
    TeamOutlined,
    HomeOutlined,
    CalendarOutlined,
    DollarOutlined
} from '@ant-design/icons'
import '../../assets/css/Adminpage/Report.css'

interface MonthData {
    month: string
    revenue: number
    guests: number
    rooms: number
}

const mockData: MonthData[] = [
    { month: 'T1', revenue: 12000000, guests: 45, rooms: 20 },
    { month: 'T2', revenue: 9500000,  guests: 38, rooms: 18 },
    { month: 'T3', revenue: 14000000, guests: 52, rooms: 24 },
    { month: 'T4', revenue: 11000000, guests: 41, rooms: 21 },
    { month: 'T5', revenue: 16000000, guests: 60, rooms: 28 },
    { month: 'T6', revenue: 18500000, guests: 72, rooms: 30 },
]

const maxRevenue = Math.max(...mockData.map(d => d.revenue))
const maxGuests = Math.max(...mockData.map(d => d.guests))

const recentTransactions = [
    { id: 1, guest: 'Nguyễn Văn A', room: 'Phòng 101', amount: 1200000, date: '03/06/2025', type: 'Checkin' },
    { id: 2, guest: 'Trần Thị B',   room: 'Phòng 203', amount: 900000,  date: '03/06/2025', type: 'Checkout' },
    { id: 3, guest: 'Lê Văn C',     room: 'Phòng 302', amount: 1500000, date: '02/06/2025', type: 'Checkin' },
    { id: 4, guest: 'Phạm Thị D',   room: 'Phòng 104', amount: 600000,  date: '02/06/2025', type: 'Checkout' },
    { id: 5, guest: 'Hoàng Văn E',  room: 'Phòng 201', amount: 1800000, date: '01/06/2025', type: 'Checkin' },
]

type Tab = 'revenue' | 'guests'

export default function Report() {
    const [tab, setTab] = useState<Tab>('revenue')
    const [range, setRange] = useState('6months')

    const totalRevenue = mockData.reduce((s, d) => s + d.revenue, 0)
    const totalGuests  = mockData.reduce((s, d) => s + d.guests, 0)
    const avgOccupancy = Math.round(mockData.reduce((s, d) => s + d.rooms, 0) / mockData.length)

    return (
        <div className="report-wrapper">

            {/* Summary cards */}
            <div className="report-summary">
                <div className="summary-card">
                    <div className="summary-icon blue"><DollarOutlined /></div>
                    <div className="summary-info">
                        <div className="summary-label">Doanh thu</div>
                        <div className="summary-value">{(totalRevenue / 1000000).toFixed(1)}M₫</div>
                        <div className="summary-sub"><RiseOutlined /> +12% so với kỳ trước</div>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon green"><TeamOutlined /></div>
                    <div className="summary-info">
                        <div className="summary-label">Khách lưu trú</div>
                        <div className="summary-value">{totalGuests}</div>
                        <div className="summary-sub"><RiseOutlined /> +8% so với kỳ trước</div>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon orange"><HomeOutlined /></div>
                    <div className="summary-info">
                        <div className="summary-label">Phòng TB/tháng</div>
                        <div className="summary-value">{avgOccupancy}</div>
                        <div className="summary-sub">Trung bình 6 tháng</div>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon purple"><CalendarOutlined /></div>
                    <div className="summary-info">
                        <div className="summary-label">Tháng hiện tại</div>
                        <div className="summary-value">T6/2025</div>
                        <div className="summary-sub">Đang cập nhật</div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="report-chart-card">
                <div className="chart-header">
                    <div className="chart-title"><BarChartOutlined /> Biểu đồ thống kê</div>
                    <div className="chart-controls">
                        <div className="tab-group">
                            <button className={tab === 'revenue' ? 'active' : ''} onClick={() => setTab('revenue')}>Doanh thu</button>
                            <button className={tab === 'guests' ? 'active' : ''} onClick={() => setTab('guests')}>Khách</button>
                        </div>
                        <select value={range} onChange={e => setRange(e.target.value)} className="range-select">
                            <option value="6months">6 tháng gần đây</option>
                            <option value="year">Cả năm</option>
                        </select>
                    </div>
                </div>

                <div className="chart-area">
                    {mockData.map(d => {
                        const val   = tab === 'revenue' ? d.revenue : d.guests
                        const max   = tab === 'revenue' ? maxRevenue : maxGuests
                        const pct   = Math.round((val / max) * 100)
                        const label = tab === 'revenue' ? `${(d.revenue / 1000000).toFixed(1)}M` : `${d.guests}`
                        return (
                            <div className="chart-bar-group" key={d.month}>
                                <div className="chart-bar-label-top">{label}</div>
                                <div className="chart-bar-track">
                                    <div
                                        className="chart-bar-fill"
                                        style={{ height: `${pct}%` }}
                                    />
                                </div>
                                <div className="chart-bar-label">{d.month}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Recent transactions */}
            <div className="report-table-card">
                <div className="report-table-title">Giao dịch gần đây</div>
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Khách hàng</th>
                            <th>Phòng</th>
                            <th>Loại</th>
                            <th>Ngày</th>
                            <th>Số tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentTransactions.map((t, i) => (
                            <tr key={t.id}>
                                <td>{i + 1}</td>
                                <td>{t.guest}</td>
                                <td>{t.room}</td>
                                <td>
                                    <span className={`type-badge type-${t.type.toLowerCase()}`}>{t.type}</span>
                                </td>
                                <td>{t.date}</td>
                                <td className="amount-cell">{t.amount.toLocaleString('vi-VN')}₫</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}