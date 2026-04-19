import { apiClient } from "../constant/api.ts";
import { API } from "../constant/config.ts";

const prefix = `${API}/Report`;

export const apiGetRevenueReport = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<any> => {
  const res = await apiClient.get(`${prefix}/revenue`, {
    params,
  });
  return res?.data;
};

export const apiGetOccupancyReport = async (
  date?: string
): Promise<any> => {
  const res = await apiClient.get(`${prefix}/occupancy`, {
    params: {
      date,
    },
  });
  return res?.data;
};

export const ReportService = {
  getRevenue: apiGetRevenueReport,
  getOccupancy: apiGetOccupancyReport,
};