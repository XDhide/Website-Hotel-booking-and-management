import { apiClient } from "../constant/api.ts";
import { API } from "../constant/config.ts";
const prefix = `${API}/Discount`;

  export const apiSearch = async (
    page = 1,
    limit = 10
  ): Promise<any> => {
    const res = await apiClient.get(
      `${prefix}?page=${page}&limit=${limit}`
    );
    return res?.data;
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
  