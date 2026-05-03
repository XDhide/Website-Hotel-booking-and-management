import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/booking`;

export const apiGetAllBookings = async (page = 1, limit = 10): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefix}?page=${page}&limit=${limit}`);
        return res?.data;
    } catch (err: any) {
        console.error("[BookingService.getAll]", err);
        return { page, limit, totalCount: 0, totalPages: 0, data: [] };
    }
};

export const apiGetMyBookings = async (): Promise<any[]> => {
    try {
        const res = await apiClient.get(`${prefix}/my-bookings`);
        const data = res?.data;
        // API returns array directly
        return Array.isArray(data) ? data : [];
    } catch (err: any) {
        console.error("[BookingService.getMyBookings]", err);
        return [];
    }
};

export const apiGetBookingById = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefix}/${id}`);
        return res?.data;
    } catch {
        return null;
    }
};

export const apiCreateBooking = async (data: any): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefix}`, data);
        return res?.data;
    } catch (err: any) {
        const msg = err?.response?.data;
        throw new Error(typeof msg === "string" ? msg : "Tạo booking thất bại");
    }
};

export const apiAdminCreateBooking = async (data: any): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefix}/admin-create`, data);
        return res?.data;
    } catch (err: any) {
        const msg = err?.response?.data;
        throw new Error(typeof msg === "string" ? msg : "Tạo booking thất bại");
    }
};

export const apiUpdateBooking = async (id: number, data: any): Promise<any> => {
    try {
        const res = await apiClient.put(`${prefix}/${id}`, data);
        return res?.data;
    } catch (err: any) {
        const msg = err?.response?.data;
        throw new Error(typeof msg === "string" ? msg : "Cập nhật booking thất bại");
    }
};

export const apiCancelBooking = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.delete(`${prefix}/${id}`);
        return res?.data;
    } catch (err: any) {
        const msg = err?.response?.data;
        throw new Error(typeof msg === "string" ? msg : "Huỷ booking thất bại");
    }
};

export const BookingService = {
    getAll:        apiGetAllBookings,
    getMyBookings: apiGetMyBookings,
    getById:       apiGetBookingById,
    create:        apiCreateBooking,
    adminCreate:   apiAdminCreateBooking,
    update:        apiUpdateBooking,
    cancel:        apiCancelBooking,
};

export const apiGetMyActiveRooms = async (): Promise<any[]> => {
    try {
        const res = await apiClient.get(`${prefix}/my-active-rooms`);
        const data = res?.data;
        return Array.isArray(data) ? data : [];
    } catch (err: any) {
        console.error("[BookingService.getMyActiveRooms]", err);
        return [];
    }
};

export const apiGetMyTransactionHistory = async (): Promise<any[]> => {
    try {
        const res = await apiClient.get(`${prefix}/my-transaction-history`);
        const data = res?.data;
        return Array.isArray(data) ? data : [];
    } catch (err: any) {
        console.error("[BookingService.getMyTransactionHistory]", err);
        return [];
    }
};
