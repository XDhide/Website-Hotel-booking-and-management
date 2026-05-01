

import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefixLost = `${API}/LostItem`;

export const apiSearchLostItem = async (page = 1, limit = 10): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefixLost}?page=${page}&limit=${limit}`);
        return res?.data;
    } catch (err: any) {
        console.error("[LostItemService.search]", err);
        return { page, limit, totalCount: 0, totalPages: 0, data: [] };
    }
};

export const apiCreateLostItem = async (data: any): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefixLost}`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Tạo đồ thất lạc thất bại");
    }
};

export const apiUpdateLostItem = async (id: number, data: any): Promise<any> => {
    try {
        const res = await apiClient.put(`${prefixLost}/${id}`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Cập nhật thất bại");
    }
};

export const apiGetLostItemById = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefixLost}/${id}`);
        return res?.data;
    } catch {
        return null;
    }
};

export const apiDeleteLostItem = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.delete(`${prefixLost}/${id}`);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Xoá thất bại");
    }
};

const prefixInvoice = `${API}/Invoice`;

export const apiSearchInvoice = async (page = 1, limit = 10): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefixInvoice}?page=${page}&limit=${limit}`);
        return res?.data;
    } catch (err: any) {
        console.error("[InvoiceService.search]", err);
        return { page, limit, totalCount: 0, totalPages: 0, data: [] };
    }
};

export const apiCreateInvoice = async (data: any): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefixInvoice}`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Tạo hoá đơn thất bại");
    }
};

export const apiUpdateInvoice = async (id: number, data: any): Promise<any> => {
    try {
        const res = await apiClient.put(`${prefixInvoice}/${id}`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Cập nhật hoá đơn thất bại");
    }
};

export const apiGetInvoiceById = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefixInvoice}/${id}`);
        return res?.data;
    } catch {
        return null;
    }
};

export const apiDeleteInvoice = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.delete(`${prefixInvoice}/${id}`);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Xoá hoá đơn thất bại");
    }
};

const prefixService = `${API}/Service`;

export const apiSearchService = async (page = 1, limit = 10): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefixService}?page=${page}&limit=${limit}`);
        return res?.data;
    } catch (err: any) {
        console.error("[ServiceService.search]", err);
        return { page, limit, totalCount: 0, totalPages: 0, data: [] };
    }
};

export const apiCreateService = async (data: any): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefixService}`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Tạo dịch vụ thất bại");
    }
};

export const apiUpdateService = async (id: number, data: any): Promise<any> => {
    try {
        const res = await apiClient.put(`${prefixService}/${id}`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Cập nhật dịch vụ thất bại");
    }
};

export const apiGetServiceById = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefixService}/${id}`);
        return res?.data;
    } catch {
        return null;
    }
};

export const apiDeleteService = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.delete(`${prefixService}/${id}`);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Xoá dịch vụ thất bại");
    }
};
