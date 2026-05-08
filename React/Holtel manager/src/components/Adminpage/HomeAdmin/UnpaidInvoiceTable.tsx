import {
  LoadingOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import "../../../assets/css/Adminpage/HomeAdmin.css";

export interface Invoice {
  invoiceId: number;
  roomUseId: number;
  subTotal: number;
  discountAmount: number;
  surchargeAmount: number;
  finalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  note?: string;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v ?? 0,
  );

interface Props {
  invoices: Invoice[];
  loading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  onReload: () => void;
}

export default function UnpaidInvoiceTable({
  invoices,
  loading,
  search,
  onSearchChange,
  onReload,
}: Props) {
  const filtered = invoices.filter(
    (inv) =>
      String(inv.roomUseId).includes(search) ||
      String(inv.invoiceId).includes(search),
  );

  return (
    <div className="unpaid-table-wrap">
      <div className="unpaid-table-header">
        <span className="unpaid-table-title">
          <FileTextOutlined /> Hoá đơn chưa thanh toán
        </span>
        <div className="dt-actions">
          <div className="unpaid-search-wrap">
            <SearchOutlined className="unpaid-search-icon" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm ID..."
            />
          </div>
          <button className="unpaid-reload-btn" onClick={onReload}>
            <ReloadOutlined />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="unpaid-table-empty">
          <LoadingOutlined /> Đang tải...
        </div>
      ) : filtered.length === 0 ? (
        <div className="unpaid-table-empty">
          <CheckCircleOutlined className="unpaid-table-empty-icon" />
          Không có hoá đơn chưa thanh toán
        </div>
      ) : (
        <table className="unpaid-table">
          <thead>
            <tr>
              {[
                "Mã HĐ",
                "Tạm tính",
                "Phụ thu",
                "Giảm giá",
                "Tổng tiền",
                "",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.invoiceId}>
                <td className="unpaid-id-td">#{inv.invoiceId}</td>
                <td className="unpaid-price-td">{fmt(inv.subTotal ?? 0)}</td>
                <td className="unpaid-price-td">
                  {inv.surchargeAmount ? fmt(inv.surchargeAmount) : "—"}
                </td>
                <td className="unpaid-discount-td">
                  {inv.discountAmount ? `-${fmt(inv.discountAmount)}` : "—"}
                </td>
                <td className="unpaid-total-td">{fmt(inv.finalAmount ?? 0)}</td>
                <td>
                  <span className="unpaid-link-td">→ Trang Hoá đơn</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
