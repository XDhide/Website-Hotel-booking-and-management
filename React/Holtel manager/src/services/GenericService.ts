
import { apiClient } from "../constant/api";

export const apiGenericGet = async (url: string): Promise<any> => {
  const res = await apiClient.get(url);
  return res?.data;
};

export const apiGenericPost = async (url: string, data: any): Promise<any> => {
  const res = await apiClient.post(url, data);
  return res?.data;
};

export const apiGenericPut = async (url: string, data: any): Promise<any> => {
  const res = await apiClient.put(url, data);
  return res?.data;
};

export const apiGenericDelete = async (url: string): Promise<any> => {
  const res = await apiClient.delete(url);
  return res?.data;
};

export const GenericService = {
  get:    apiGenericGet,
  post:   apiGenericPost,
  put:    apiGenericPut,
  delete: apiGenericDelete,
};
