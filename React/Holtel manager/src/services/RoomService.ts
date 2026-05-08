import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/rooms`;

export const apiSearch = async (page = 1, limit = 10): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefix}?page=${page}&limit=${limit}`);
        return res?.data;
    } catch (err: any) {
        console.error("[RoomService.search]", err);
        return { page, limit, totalCount: 0, totalPages: 0, data: [] };
    }
};

export const apiGetById = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefix}/${id}`);
        return res?.data;
    } catch (err: any) {
        console.error(`[RoomService.getById(${id})]`, err);
        return null;
    }
};

export const apiCreate = async (data: any): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefix}`, data);
        return res?.data;
    } catch (err: any) {
        const msg = err?.response?.data;
        throw new Error(typeof msg === "string" ? msg : "Tạo phòng thất bại");
    }
};

export const apiUpdate = async (id: number, data: any): Promise<any> => {
    try {
        const res = await apiClient.put(`${prefix}/${id}`, data);
        return res?.data;
    } catch (err: any) {
        const msg = err?.response?.data;
        throw new Error(typeof msg === "string" ? msg : "Cập nhật phòng thất bại");
    }
};

export const apiDelete = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.delete(`${prefix}/${id}`);
        return res?.data;
    } catch (err: any) {
        const msg = err?.response?.data;
        throw new Error(typeof msg === "string" ? msg : "Xoá phòng thất bại");
    }
};

export const RoomService = {
    search:  apiSearch,
    getById: apiGetById,
    create:  apiCreate,
    update:  apiUpdate,
    delete:  apiDelete,
};


export const apiGetAllRooms    = (page = 1, limit = 10) => apiSearch(page, limit);
export const apiCreateRoom     = (data: any)            => apiCreate(data);
export const apiUpdateRoom     = (id: number, data: any)=> apiUpdate(id, data);
export const apiDeleteRoom     = (id: number)           => apiDelete(id);
