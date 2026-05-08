import { useState, useEffect, useCallback } from "react";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import Modal from "./Modal";
import {
  apiGenericGet,
  apiGenericPost,
  apiGenericPut,
  apiGenericDelete,
} from "../../services/GenericService";
import { API } from "../../constant/config";
import "../../assets/css/Adminpage/DataTable.css";

export type FieldMeta = {
  label?: string;
  render?: (value: any, row: any) => React.ReactNode;
  inputType?: "text" | "select" | "number" | "email" | "textarea" | "date";
  options?: string[];
  hidden?: boolean;
  readOnly?: boolean;
};
export type FieldsMeta = Record<string, FieldMeta>;

function normalize(raw: any): {
  items: any[];
  totalPages: number;
  totalCount: number;
} {
  if (Array.isArray(raw))
    return { items: raw, totalPages: 1, totalCount: raw.length };
  const items = raw?.data ?? raw?.items ?? raw?.result ?? [];
  const totalCount = raw?.totalCount ?? raw?.total ?? items.length;
  const totalPages =
    raw?.totalPages ??
    raw?.pageCount ??
    Math.max(1, Math.ceil(totalCount / 10));
  return { items: Array.isArray(items) ? items : [], totalPages, totalCount };
}

interface ApiDataTableProps {
  apiPrefix: string;
  fieldsMeta?: FieldsMeta;
  pageSize?: number;
  emptyForm: Record<string, any>;
  customGetUrl?: (page: number, limit: number) => string;
  idKey?: string;
}

export default function ApiDataTable({
  apiPrefix,
  fieldsMeta = {},
  pageSize = 10,
  emptyForm,
  customGetUrl,
  idKey = "id",
}: ApiDataTableProps) {
  const prefix = `${API}/${apiPrefix}`;
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [saving, setSaving] = useState(false);

  const allKeys = Object.keys(emptyForm);
  const visibleKeys = allKeys.filter((k) => !fieldsMeta[k]?.hidden);

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      setError("");
      try {
        const url = customGetUrl
          ? customGetUrl(p, pageSize)
          : `${prefix}?page=${p}&limit=${pageSize}`;
        const res = await apiGenericGet(url);
        const { items, totalPages: tp, totalCount: tc } = normalize(res);
        setData(items);
        setTotalPages(tp);
        setTotalCount(tc);
      } catch (e: any) {
        const msg = e?.response?.data;
        setError(typeof msg === "string" ? msg : "Không thể tải dữ liệu");
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [prefix, pageSize, customGetUrl],
  );

  useEffect(() => {
    load(page);
  }, [load, page]);

  const filtered = data.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setForm(emptyForm);
    setEditTarget(null);
    setModalMode("add");
  };
  const openEdit = (item: any) => {
    const filtered: Record<string, any> = {};
    allKeys.forEach((k) => {
      filtered[k] = item[k] ?? emptyForm[k];
    });
    setEditTarget(item);
    setForm(filtered);
    setModalMode("edit");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xác nhận xoá?")) return;
    try {
      await apiGenericDelete(`${prefix}/${id}`);
      await load(page);
    } catch (e: any) {
      alert(e?.response?.data || "Xoá thất bại");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modalMode === "add") await apiGenericPost(`${prefix}`, form);
      else if (editTarget)
        await apiGenericPut(`${prefix}/${editTarget[idKey]}`, form);
      setModalMode(null);
      await load(page);
    } catch (e: any) {
      const msg = e?.response?.data;
      alert(
        typeof msg === "string" ? msg : JSON.stringify(msg) || "Lưu thất bại",
      );
    } finally {
      setSaving(false);
    }
  };

  const renderField = (key: string) => {
    const meta = fieldsMeta[key];
    if (meta?.readOnly || meta?.hidden) return null;
    const rawVal = form[key];

    const value =
      meta?.inputType === "date"
        ? rawVal
          ? String(rawVal).split("T")[0]
          : ""
        : String(rawVal ?? "");
    const type = meta?.inputType ?? "text";
    const label = meta?.label ?? key;
    return (
      <div className="form-group" key={key}>
        <label>{label}</label>
        {type === "select" && meta?.options ? (
          <select
            value={value}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          >
            {meta.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            value={value}
            rows={3}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder={`Nhập ${label.toLowerCase()}`}
          />
        ) : type === "date" ? (
          <input
            type="date"
            value={value}
            onChange={(e) =>
              setForm((f) => ({ ...f, [key]: e.target.value || null }))
            }
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder={`Nhập ${label.toLowerCase()}`}
          />
        )}
      </div>
    );
  };

  const pageNums = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => Math.max(1, Math.min(page - 2, totalPages - 4)) + i,
  ).filter((p) => p >= 1 && p <= totalPages);

  return (
    <div className="datatable-wrapper">
      <div className="datatable-header">
        <div className="search-box">
          <SearchOutlined className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="dt-actions">
          <button
            className="btn-add dt-reload-btn"
            onClick={() => load(page)}
            title="Tải lại"
          >
            <ReloadOutlined />
          </button>
          <button className="btn-add" onClick={openAdd}>
            <PlusOutlined /> Thêm mới
          </button>
        </div>
      </div>

      {error && <div className="dt-error-msg">⚠ {error}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              {visibleKeys.map((k) => (
                <th key={k}>{fieldsMeta[k]?.label ?? k}</th>
              ))}
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={visibleKeys.length + 2}
                  className="dt-loading-state"
                >
                  Đang tải...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={visibleKeys.length + 2} className="dt-empty-state">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr
                  key={row[idKey] ?? i}
                  onClick={() => openEdit(row)}
                  className="dt-row-click"
                >
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  {visibleKeys.map((k) => (
                    <td key={k}>
                      {fieldsMeta[k]?.render
                        ? fieldsMeta[k].render!(row[k], row)
                        : String(row[k] ?? "")}
                    </td>
                  ))}
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDelete(row[idKey])}
                      title="Xoá"
                    >
                      <span className="btn-icon delete">
                        <DeleteOutlined />
                      </span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {}
      <div className="pagination">
        <span className="pagination-info">
          Tổng {totalCount} bản ghi — Trang {page}/{totalPages}
        </span>
        <div className="pagination-controls">
          <button disabled={page <= 1} onClick={() => setPage(1)}>
            «
          </button>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ‹
          </button>
          {pageNums.map((p) => (
            <button
              key={p}
              className={page === p ? "active" : ""}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            ›
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(totalPages)}
          >
            »
          </button>
        </div>
      </div>

      {modalMode && (
        <Modal
          title={modalMode === "add" ? "Thêm mới" : "Chỉnh sửa"}
          onClose={() => setModalMode(null)}
          onSave={handleSave}
        >
          {saving ? (
            <div className="dt-saving-state">Đang lưu...</div>
          ) : (
            allKeys.map((k) => renderField(k))
          )}
        </Modal>
      )}
    </div>
  );
}
