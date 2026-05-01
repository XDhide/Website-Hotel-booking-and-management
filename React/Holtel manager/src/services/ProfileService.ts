import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/Profile`;

export const apiGetProfile = async (): Promise<any> => {
    try {
        const res = await apiClient.get(prefix);
        return res?.data;
    } catch (err: any) {
        console.error("[ProfileService.get]", err);
        return null;
    }
};

export const apiUpdateProfile = async (data: any): Promise<any> => {
    try {
        const res = await apiClient.put(prefix, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Cập nhật profile thất bại");
    }
};

export const apiChangePassword = async (data: { currentPassword: string; newPassword: string }): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefix}/change-password`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Đổi mật khẩu thất bại");
    }
};

export const ProfileService = {
    get:            apiGetProfile,
    update:         apiUpdateProfile,
    changePassword: apiChangePassword,
};
