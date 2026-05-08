import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/Invoice`;

export const apiSearch = async (page = 1, limit = 10): Promise<any> => {
  try {
    const res = await apiClient.get(`${prefix}?page=${page}&limit=${limit}`);
    return res?.data;
  } catch (err: any) {
    return { page, limit, totalCount: 0, totalPages: 0, data: [] };
  }
};

export const apiCreate = async (data: any): Promise<any> => {
  const res = await apiClient.post(`${prefix}`, data);
  return res?.data;
};

export const apiUpdate = async (id: number, data: any): Promise<any> => {
  const res = await apiClient.put(`${prefix}/${id}`, data);
  return res?.data;
};

export const apiGetById = async (id: number): Promise<any> => {
  const res = await apiClient.get(`${prefix}/${id}`);
  return res?.data;
};

export const apiDelete = async (id: number): Promise<any> => {
  const res = await apiClient.delete(`${prefix}/${id}`);
  return res?.data;
};

export const apiGetMyInvoices = async (): Promise<any[]> => {
  try {
    const res = await apiClient.get(`${prefix}/my-invoices`);
    const raw = res?.data;
    return Array.isArray(raw) ? raw : raw?.data ?? [];
  } catch {
    return [];
  }
};

export const apiGetInvoiceWithDetails = async (invoiceId: number): Promise<any> => {
  try {
    const res = await apiClient.get(`${prefix}/${invoiceId}/details`);
    return res?.data;
  } catch {
    return null;
  }
};

export const apiAddService = async (data: {
  roomUseId: number;
  serviceId: number;
  quantity: number;
}): Promise<any> => {
  const res = await apiClient.post(`${API}/invoicedetail/add-service`, data);
  return res?.data;
};

export const apiGetServices = async (): Promise<any[]> => {
  try {
    const res = await apiClient.get(`${API}/services?page=1&limit=100`);
    const raw = res?.data;
    return Array.isArray(raw) ? raw : raw?.data ?? [];
  } catch {
    return [];
  }
};

export const apiGetInvoiceDetails = async (invoiceId: number): Promise<any[]> => {
  try {
    const res = await apiClient.get(`${API}/invoicedetail/by-invoice/${invoiceId}`);
    const raw = res?.data;
    return Array.isArray(raw) ? raw : raw?.data ?? [];
  } catch {
    return [];
  }
};

export const apiPayInvoice = async (invoiceId: number, data: {
  paymentMethod: string;
  discountAmount?: number;
  surchargeAmount?: number;
  note?: string;
}): Promise<any> => {
  const res = await apiClient.post(`${API}/invoice/${invoiceId}/pay`, data);
  return res?.data;
};

export const apiGetChatStatus = async (chatId: number): Promise<any> => {
  const res = await apiClient.get(`${API}/SupportChat/${chatId}/status`);
  return res?.data;
};

export const apiGetServiceNotifications = async (): Promise<any[]> => {
  try {
    const res = await apiClient.get(`${API}/invoicedetail/service-notifications`);
    return Array.isArray(res?.data) ? res.data : [];
  } catch { return []; }
};

export const apiMarkNotificationRead = async (id: number): Promise<void> => {
  await apiClient.post(`${API}/invoicedetail/service-notifications/${id}/read`);
};

export const apiMarkAllNotificationsRead = async (): Promise<void> => {
  await apiClient.post(`${API}/invoicedetail/service-notifications/read-all`);
};
