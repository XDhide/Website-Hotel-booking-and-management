import { SearchOutlined,MoneyCollectOutlined } from "@ant-design/icons";
import { useState } from "react";
import '../../assets/css/Adminpage/Payment.css'
interface bill {
    id: number,
    room: string,
    price: number
}
const comBill: bill[] = [
    {id: 1,room:"1",price:3},
    {id: 2,room:"1",price:3},
    {id: 3,room:"1",price:3},
    {id: 4,room:"1",price:3}
]
export default function Payment(){
    const [search,setSearch] = useState('')
    return (
        <div className="payment-wapper">
            <div className="payment-header">
                <div className="search-box">
                    <SearchOutlined className="search-icon" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm..."
                      value={search}
                      onChange={e => { setSearch(e.target.value); }}
                    />
                </div>
            </div>
            <div className="payment-body">
                <div className="payment-bill">
                    {comBill.map(() => (
                        <div className="payment-bill-peason">
                            <div className="payment-bill-name"></div>
                            <div><MoneyCollectOutlined /></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}