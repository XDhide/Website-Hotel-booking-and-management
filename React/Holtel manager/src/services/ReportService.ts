import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/report`;

export const apiGetRevenue = async (startDate?: string, endDate?: string): Promise<any> => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate)   params.append("endDate", endDate);
        const res = await apiClient.get(`${prefix}/revenue?${params.toString()}`);
        return res?.data;
    } catch (err: any) {
        console.error("[ReportService.getRevenue]", err);
        return null;
    }
};

export const apiGetOccupancy = async (date?: string): Promise<any> => {
    try {
        const params = date ? `?date=${date}` : "";
        const res = await apiClient.get(`${prefix}/occupancy${params}`);
        return res?.data;
    } catch (err: any) {
        console.error("[ReportService.getOccupancy]", err);
        return null;
    }
};

export const ReportService = {
    getRevenue:   apiGetRevenue,
    getOccupancy: apiGetOccupancy,
};
