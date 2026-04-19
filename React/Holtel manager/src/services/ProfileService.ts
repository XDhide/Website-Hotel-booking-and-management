import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/Profile`;

// Lấy profile
export const apiGetProfile = async (): Promise<any> => {
  const res = await apiClient.get(`${prefix}`);
  return res?.data;
};

// Update profile
export const apiUpdateProfile = async (data: {
  userName?: string;
  email?: string;
  phoneNumber?: string;
}): Promise<any> => {
  const res = await apiClient.put(`${prefix}`, data);
  return res?.data;
};

// Change password
export const apiChangePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<any> => {
  const res = await apiClient.post(`${prefix}/change-password`, data);
  return res?.data;
};

// Service tổng hợp
export const ProfileService = {
  get: apiGetProfile,
  update: apiUpdateProfile,
  changePassword: apiChangePassword,
};