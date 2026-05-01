import { apiClient } from "../constant/api";
import { saveAuth } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/Account`;

export const apiLogin = async (data: { username: string; password: string }): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefix}/login`, data);
        const { token, userName, email, roles } = res.data;
        saveAuth(token, { userName, email }, roles);
        return res.data;
    } catch (err: any) {
        const msg = err?.response?.data;
        throw new Error(typeof msg === "string" ? msg : "Đăng nhập thất bại");
    }
};

export const apiRegister = async (data: { username: string; email: string; password: string }): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefix}/register`, data);
        return res.data;
    } catch (err: any) {
        const msg = err?.response?.data;
        throw new Error(typeof msg === "string" ? msg : "Đăng ký thất bại");
    }
};

export const apiGetMe = async (): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefix}/me`);
        return res.data;
    } catch {
        return null;
    }
};

export const apiGetUserList = async (page = 1, limit = 10): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefix}/userlist?page=${page}&limit=${limit}`);
        return res?.data;
    } catch (err: any) {
        console.error("[AccountService.userlist]", err);
        return { page, limit, totalCount: 0, totalPages: 0, data: [] };
    }
};

export const AccountService = {
    login:       apiLogin,
    register:    apiRegister,
    getMe:       apiGetMe,
    getUserList: apiGetUserList,
};
