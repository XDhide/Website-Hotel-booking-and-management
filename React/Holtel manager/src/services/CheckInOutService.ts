import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/CheckInOut`;

// Check-in
export const apiCheckIn = async (data: {
  bookingId: number;
}): Promise<any> => {
  const res = await apiClient.post(`${prefix}/checkin`, data);
  return res?.data;
};

// Check-out
export const apiCheckOut = async (data: {
  bookingId: number;
}): Promise<any> => {
  const res = await apiClient.post(`${prefix}/checkout`, data);
  return res?.data;
};

// Transfer room
export const apiTransferRoom = async (data: {
  bookingId: number;
  newRoomId: number;
}): Promise<any> => {
  const res = await apiClient.post(`${prefix}/transfer-room`, data);
  return res?.data;
};

// Extend booking
export const apiExtendBooking = async (data: {
  bookingId: number;
  newCheckOutDate: string; // ISO string: "2026-04-20"
}): Promise<any> => {
  const res = await apiClient.post(`${prefix}/extend`, data);
  return res?.data;
};

// Service tổng hợp
export const CheckInOutService = {
  checkIn: apiCheckIn,
  checkOut: apiCheckOut,
  transferRoom: apiTransferRoom,
  extend: apiExtendBooking,
};