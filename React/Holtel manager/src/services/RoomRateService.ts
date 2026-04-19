import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/RoomRate`;

// Get all (có phân trang)
export const apiGetAllRoomRates = async (
  page = 1,
  limit = 10
): Promise<any> => {
  const res = await apiClient.get(`${prefix}?page=${page}&limit=${limit}`);
  return res?.data;
};

// Get by id
export const apiGetRoomRateById = async (id: number): Promise<any> => {
  const res = await apiClient.get(`${prefix}/${id}`);
  return res?.data;
};

// Create
export const apiCreateRoomRate = async (
  idRoomType: number,
  data: {
    price: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<any> => {
  // ⚠️ backend nhận IdRoomType riêng (query param)
  const res = await apiClient.post(
    `${prefix}?IdRoomType=${idRoomType}`,
    data
  );
  return res?.data;
};

// Update
export const apiUpdateRoomRate = async (
  id: number,
  data: {
    price?: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<any> => {
  const res = await apiClient.put(`${prefix}/${id}`, data);
  return res?.data;
};

// Delete
export const apiDeleteRoomRate = async (id: number): Promise<any> => {
  const res = await apiClient.delete(`${prefix}/${id}`);
  return res?.data;
};

// Service tổng hợp
export const RoomRateService = {
  getAll: apiGetAllRoomRates,
  getById: apiGetRoomRateById,
  create: apiCreateRoomRate,
  update: apiUpdateRoomRate,
  delete: apiDeleteRoomRate,
};