import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/discount`;

export const apiSearchDiscount = async (page = 1, limit = 10): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefix}?page=${page}&limit=${limit}`);
        return res?.data;
    } catch (err: any) {
        console.error("[DiscountService.search]", err);
        return { page, limit, totalCount: 0, totalPages: 0, data: [] };
    }
};

export const apiCreateDiscount = async (data: any): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefix}`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Tạo giảm giá thất bại");
    }
};

export const apiUpdateDiscount = async (id: number, data: any): Promise<any> => {
    try {
        const res = await apiClient.put(`${prefix}/${id}`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Cập nhật giảm giá thất bại");
    }
};

export const apiDeleteDiscount = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.delete(`${prefix}/${id}`);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Xoá giảm giá thất bại");
    }
};

export const DiscountService = {
    search: apiSearchDiscount,
    create: apiCreateDiscount,
    update: apiUpdateDiscount,
    delete: apiDeleteDiscount,
};
