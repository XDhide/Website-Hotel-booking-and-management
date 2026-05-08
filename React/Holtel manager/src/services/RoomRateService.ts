import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/RoomRate`;

export const apiGetAllRoomRates = async (
  page = 1,
  limit = 10
): Promise<any> => {
  const res = await apiClient.get(`${prefix}?page=${page}&limit=${limit}`);
  return res?.data;
};

export const apiGetRoomRateById = async (id: number): Promise<any> => {
  const res = await apiClient.get(`${prefix}/${id}`);
  return res?.data;
};

export const apiCreateRoomRate = async (
  idRoomType: number,
  data: {
    price: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<any> => {

  const res = await apiClient.post(
    `${prefix}?IdRoomType=${idRoomType}`,
    data
  );
  return res?.data;
};

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

export const apiDeleteRoomRate = async (id: number): Promise<any> => {
  const res = await apiClient.delete(`${prefix}/${id}`);
  return res?.data;
};

export const RoomRateService = {
  getAll: apiGetAllRoomRates,
  getById: apiGetRoomRateById,
  create: apiCreateRoomRate,
  update: apiUpdateRoomRate,
  delete: apiDeleteRoomRate,
};
export const apiGetRoomRateByRoomType = async (roomTypeId: number): Promise<any[]> => {
  try {
    const res = await apiClient.get(`${prefix}/by-roomtype/${roomTypeId}`);
    return Array.isArray(res?.data) ? res.data : [];
  } catch {
    return [];
  }
};
