import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/Booking`;

export const apiGetAllBookings = async (page = 1, limit = 10): Promise<any> => {
  const res = await apiClient.get(`${prefix}?page=${page}&limit=${limit}`);
  return res?.data;
};

export const apiGetBookingById = async (id: number): Promise<any> => {
  const res = await apiClient.get(`${prefix}/${id}`);
  return res?.data;
};

export const apiGetMyBookings = async (): Promise<any> => {
  const res = await apiClient.get(`${prefix}/my-bookings`);
  return res?.data;
};

export const apiCreateBooking = async (data: {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
}): Promise<any> => {
  const res = await apiClient.post(`${prefix}`, data);
  return res?.data;
};

export const apiUpdateBooking = async (id: number, data: any): Promise<any> => {
  const res = await apiClient.put(`${prefix}/${id}`, data);
  return res?.data;
};

export const apiCancelBooking = async (id: number): Promise<any> => {
  const res = await apiClient.delete(`${prefix}/${id}`);
  return res?.data;
};

export const BookingService = {
  getAll: apiGetAllBookings,
  getById: apiGetBookingById,
  getMy: apiGetMyBookings,
  create: apiCreateBooking,
  update: apiUpdateBooking,
  cancel: apiCancelBooking,
};