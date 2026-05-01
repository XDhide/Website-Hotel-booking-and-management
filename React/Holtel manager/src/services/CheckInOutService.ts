import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/CheckInOut`;

export const apiCheckIn = async (data: { bookingId: number; roomId: number; checkInActual?: string }): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefix}/checkin`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Check-in thất bại");
    }
};

export const apiCheckOut = async (data: { roomInUseId: number; checkOutActual?: string }): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefix}/checkout`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Check-out thất bại");
    }
};

export const apiTransferRoom = async (data: { roomInUseId: number; newRoomId: number }): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefix}/transfer-room`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Chuyển phòng thất bại");
    }
};

export const apiExtendStay = async (data: { roomInUseId: number; newCheckOutDate: string }): Promise<any> => {
    try {
        const res = await apiClient.post(`${prefix}/extend`, data);
        return res?.data;
    } catch (err: any) {
        throw new Error(err?.response?.data || "Gia hạn thất bại");
    }
};

export const CheckInOutService = {
    checkIn:     apiCheckIn,
    checkOut:    apiCheckOut,
    transferRoom: apiTransferRoom,
    extend:      apiExtendStay,
};
