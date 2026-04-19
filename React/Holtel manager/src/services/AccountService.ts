import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/Account`;

export const apiRegister = async (data: {
  username: string;
  email: string;
  password: string;
}): Promise<any> => {
  const res = await apiClient.post(`${prefix}/register`, data);
  return res?.data;
};

export const apiLogin = async (data: {
  username: string;
  password: string;
}): Promise<any> => {
  const res = await apiClient.post(`${prefix}/login`, data);
  return res?.data;
};

export const apiGetMe = async (): Promise<any> => {
  const res = await apiClient.get(`${prefix}/me`);
  return res?.data;
};

export const apiAssignRole = async (data: {
  username: string;
  role: string;
}): Promise<any> => {
  const res = await apiClient.post(`${prefix}/assign-role`, data);
  return res?.data;
};

// GET ALL USERS — endpoint GET /api/Account/userlist
export const apiGetUserList = async (page = 1, limit = 10): Promise<any> => {
  const res = await apiClient.get(`${prefix}/userlist?page=${page}&limit=${limit}`);
  return res?.data;
};

export const AccountService = {
  register: apiRegister,
  login: apiLogin,
  getMe: apiGetMe,
  assignRole: apiAssignRole,
  getUserList: apiGetUserList,
};