import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefixIncident = `${API}/Incident`;

export const apiSearchIncident = async (page = 1, limit = 10): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefixIncident}?page=${page}&limit=${limit}`);
        return res?.data;
    } catch (err: any) {
        console.error("[IncidenceService.search]", err);
        return { page, limit, totalCount: 0, totalPages: 0, data: [] };
    }
};

export const apiCreateIncident = async (data: any): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefixIncident}`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Tạo sự cố thất bại");
    }
};

export const apiUpdateIncident = async (id: number, data: any): Promise<any> => {
    try {
        const res = await apiClient.put(`${prefixIncident}/${id}`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Cập nhật sự cố thất bại");
    }
};

export const apiGetIncidentById = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefixIncident}/${id}`);
        return res?.data;
    } catch {
        return null;
    }
};

export const apiDeleteIncident = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.delete(`${prefixIncident}/${id}`);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Xoá sự cố thất bại");
    }
};

const prefixPayment = `${API}/Invoice`;

export const apiGetPaymentsByBooking = async (bookingId: number): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefixPayment}?page=1&limit=50`);
        const all = res?.data?.data ?? [];
        return all.filter((i: any) => i.bookingId === bookingId || i.roomUseId === bookingId);
    } catch (err: any) {
        console.error("[PaymentService.getByBooking]", err);
        return [];
    }
};

export const apiCreatePayment = async (data: {
    bookingId: number;
    amount:    number;
    method?:   string;
}): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefixPayment}`, {
            roomUseId:     data.bookingId,
            finalAmount:   data.amount,
            paymentMethod: data.method ?? "Cash",
            paymentStatus: "Paid",
        });
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Thanh toán thất bại");
    }
};

export const apiMergeInvoices = async (_data: { bookingIds: number[] }): Promise<any> => {
    console.warn("[PaymentService.mergeInvoices] Endpoint chưa được implement ở backend");
    return { message: "Tính năng gộp hoá đơn đang được phát triển." };
};

export const apiSplitInvoice = async (_data: { bookingId: number; amounts: number[] }): Promise<any> => {
    console.warn("[PaymentService.splitInvoice] Endpoint chưa được implement ở backend");
    return { message: "Tính năng tách hoá đơn đang được phát triển." };
};

export const PaymentService = {
    getByBooking:  apiGetPaymentsByBooking,
    create:        apiCreatePayment,
    mergeInvoices: apiMergeInvoices,
    splitInvoice:  apiSplitInvoice,
};

const prefixChat = `${API}/SupportChat`;

export const apiGetMyChats = async (): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefixChat}/my-chats`);
        return res?.data ?? [];
    } catch (err: any) {
        console.error("[SupportChatService.getMyChats]", err);
        return [];
    }
};

export const apiGetChatById = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefixChat}/${id}`);
        return res?.data;
    } catch {
        return null;
    }
};

export const apiOpenChat = async (): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefixChat}/open`);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Mở chat thất bại");
    }
};

export const apiSendMessage = async (data: {
    supportChatId: number;
    message:       string;
}): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefixChat}/send-message`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Gửi tin nhắn thất bại");
    }
};

export const apiCloseChat = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefixChat}/${id}/close`);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Đóng chat thất bại");
    }
};

export const apiGetMessages = async (id: number): Promise<any> => {
    try {
        const res = await apiClient.get(`${prefixChat}/${id}/messages`);
        return res?.data ?? [];
    } catch (err: any) {
        console.error(`[SupportChatService.getMessages(${id})]`, err);
        return [];
    }
};

export const SupportChatService = {
    getMyChats:  apiGetMyChats,
    getById:     apiGetChatById,
    openChat:    apiOpenChat,
    sendMessage: apiSendMessage,
    closeChat:   apiCloseChat,
    getMessages: apiGetMessages,
};
