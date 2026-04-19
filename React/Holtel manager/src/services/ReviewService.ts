import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/Review`;

// Get all reviews
export const apiGetAllReviews = async (): Promise<any> => {
  const res = await apiClient.get(`${prefix}`);
  return res?.data;
};

// Get review by id
export const apiGetReviewById = async (id: number): Promise<any> => {
  const res = await apiClient.get(`${prefix}/${id}`);
  return res?.data;
};

// Create review
export const apiCreateReview = async (data: {
  rating: number;
  comment: string;
  bookingId?: number; // tùy DTO backend của bạn
  roomId?: number;
  userId?: string;
}): Promise<any> => {
  const res = await apiClient.post(`${prefix}`, data);
  return res?.data;
};

// Update review
export const apiUpdateReview = async (
  id: number,
  data: {
    rating?: number;
    comment?: string;
  }
): Promise<any> => {
  const res = await apiClient.put(`${prefix}/${id}`, data);
  return res?.data;
};

// Delete review
export const apiDeleteReview = async (id: number): Promise<any> => {
  const res = await apiClient.delete(`${prefix}/${id}`);
  return res?.data;
};

// Service tổng hợp
export const ReviewService = {
  getAll: apiGetAllReviews,
  getById: apiGetReviewById,
  create: apiCreateReview,
  update: apiUpdateReview,
  delete: apiDeleteReview,
};