import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/Favorite`;

export interface FavoriteDto {
  favoriteId: number;
  roomTypeId: number;
  roomTypeName: string;
  createdAt: string;
}


export const apiGetFavorites = async (): Promise<FavoriteDto[]> => {
  try {
    const res = await apiClient.get(prefix);
    return res.data ?? [];
  } catch {
    return [];
  }
};


export const apiGetFavoriteIds = async (): Promise<number[]> => {
  try {
    const res = await apiClient.get(`${prefix}/ids`);
    return res.data ?? [];
  } catch {
    return [];
  }
};


export const apiAddFavorite = async (roomTypeId: number): Promise<FavoriteDto | null> => {
  try {
    const res = await apiClient.post(prefix, { roomTypeId });
    return res.data;
  } catch (err: any) {
    const msg = err?.response?.data;
    throw new Error(typeof msg === "string" ? msg : "Thêm yêu thích thất bại");
  }
};


export const apiRemoveFavorite = async (roomTypeId: number): Promise<void> => {
  try {
    await apiClient.delete(`${prefix}/${roomTypeId}`);
  } catch (err: any) {
    const msg = err?.response?.data;
    throw new Error(typeof msg === "string" ? msg : "Xóa yêu thích thất bại");
  }
};


export const apiToggleFavorite = async (
  roomTypeId: number
): Promise<{ liked: boolean }> => {
  try {
    const res = await apiClient.post(`${prefix}/toggle/${roomTypeId}`);
    return { liked: res.data.liked };
  } catch (err: any) {
    const msg = err?.response?.data;
    throw new Error(typeof msg === "string" ? msg : "Thao tác yêu thích thất bại");
  }
};
