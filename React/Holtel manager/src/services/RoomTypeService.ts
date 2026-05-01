import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/roomtype`;

export const apiSearchRoomType = async (page = 1, limit = 10): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefix}?page=${page}&limit=${limit}`);
        return res?.data;
    } catch (err: any) {
        console.error("[RoomTypeService.search]", err);
        return { page, limit, totalCount: 0, totalPages: 0, data: [] };
    }
};

export const apiGetRoomTypeById = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefix}/${id}`);
        return res?.data;
    } catch {
        return null;
    }
};

export const apiCreateRoomType = async (data: any): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefix}`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Tạo loại phòng thất bại");
    }
};

export const apiUpdateRoomType = async (id: number, data: any): Promise<any> => {
    try {
        const res = await apiClient.put(`${prefix}/${id}`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Cập nhật loại phòng thất bại");
    }
};

export const apiDeleteRoomType = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.delete(`${prefix}/${id}`);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Xoá loại phòng thất bại");
    }
};

export const apiAddRoomTypeImage = async (id: number, data: { imageUrl: string; altText?: string; displayOrder?: number }): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefix}/${id}/images`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Thêm ảnh thất bại");
    }
};

export const apiDeleteRoomTypeImage = async (roomTypeId: number, imageId: number): Promise<any> => {
    try {
        const res = await apiClient.delete(`${prefix}/${roomTypeId}/images/${imageId}`);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Xoá ảnh thất bại");
    }
};

export const apiGetRoomTypeImages = async (id: number): Promise<any[]> => {
    try {
        const res = await apiClient.get(`${prefix}/${id}/images`);
        return res?.data ?? [];
    } catch {
        return [];
    }
};
