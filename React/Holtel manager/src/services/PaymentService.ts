import { apiClient } from "../constant/api.ts";
import { API } from "../constant/config.ts";

const prefix = `${API}/Payment`;

export const apiGetPaymentsByBooking = async (bookingId: number): Promise<any> => {
  const res = await apiClient.get(`${prefix}/booking/${bookingId}`);
  return res?.data;
};

export const apiCreatePayment = async (data: {
  bookingId: number;
  amount: number;
  method?: string;
}): Promise<any> => {
  const res = await apiClient.post(`${prefix}`, data);
  return res?.data;
};

export const apiMergeInvoices = async (data: {
  bookingIds: number[];
}): Promise<any> => {
  const res = await apiClient.post(`${prefix}/merge-invoices`, data);
  return res?.data;
};

export const apiSplitInvoice = async (data: {
  bookingId: number;
  amounts: number[];
}): Promise<any> => {
  const res = await apiClient.post(`${prefix}/split-invoice`, data);
  return res?.data;
};

export const PaymentService = {
  getByBooking: apiGetPaymentsByBooking,
  create: apiCreatePayment,
  mergeInvoices: apiMergeInvoices,
  splitInvoice: apiSplitInvoice,
};