import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/lostitem`;

export interface CreateLostItemDto {
  roomId: number;
  roomUseId: number;
  itemName: string;
  description: string;
  status: string;
  foundAt: string | null;
}

export interface LostItemDto {
  lostItemId: number;
  roomId: number;
  roomUseId: number;
  itemName: string;
  description: string;
  status: string;
  foundAt: string | null;
  roomNumber?: string;
  createdAt: string;
}


export const apiGetMyLostItems = async (): Promise<LostItemDto[]> => {
  try {
    const res = await apiClient.get(`${prefix}/my-lostitem`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err: any) {
    console.error("[LostItemService.getMyLostItems]", err);
    return [];
  }
};


export const apiReportLostItem = async (
  data: CreateLostItemDto
): Promise<LostItemDto> => {
  const res = await apiClient.post(`${prefix}`, data);
  return res?.data;
};


export const apiGetAllLostItems = async (page = 1, limit = 10): Promise<any> => {
  try {
    const res = await apiClient.get(`${prefix}?page=${page}&limit=${limit}`);
    return res?.data;
  } catch (err: any) {
    console.error("[LostItemService.getAll]", err);
    return { page, limit, totalCount: 0, totalPages: 0, data: [] };
  }
};


export const apiUpdateLostItem = async (
  id: number,
  data: Partial<CreateLostItemDto>
): Promise<LostItemDto | null> => {
  try {
    const res = await apiClient.put(`${prefix}/${id}`, data);
    return res?.data ?? null;
  } catch (err: any) {
    console.error("[LostItemService.update]", err);
    return null;
  }
};


export const apiGetLostItemById = async (id: number): Promise<any> => {
  const res = await apiClient.get(`${prefix}/${id}`);
  return res?.data;
};


export const apiDeleteLostItem = async (id: number): Promise<any> => {
  const res = await apiClient.delete(`${prefix}/${id}`);
  return res?.data;
};

export const LostItemService = {
  getMyLostItems: apiGetMyLostItems,
  report: apiReportLostItem,
  getAll: apiGetAllLostItems,
  update: apiUpdateLostItem,
  getById: apiGetLostItemById,
  delete: apiDeleteLostItem,
};
