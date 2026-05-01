import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/review`;

export const apiGetReviews = async (page = 1, limit = 10): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefix}?page=${page}&limit=${limit}`);
        return res?.data;
    } catch (err: any) {
        console.error("[ReviewService.getAll]", err);
        return { data: [], totalCount: 0 };
    }
};

export const apiGetReviewById = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefix}/${id}`);
        return res?.data;
    } catch {
        return null;
    }
};

export const apiCreateReview = async (data: any): Promise<any> => {
    try {
        const res = await apiClient.post(prefix, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Gửi đánh giá thất bại");
    }
};

export const apiUpdateReview = async (id: number, data: any): Promise<any> => {
    try {
        const res = await apiClient.put(`${prefix}/${id}`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Cập nhật đánh giá thất bại");
    }
};

export const ReviewService = {
    getAll:  apiGetReviews,
    getById: apiGetReviewById,
    create:  apiCreateReview,
    update:  apiUpdateReview,
};
