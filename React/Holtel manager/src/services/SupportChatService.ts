import { apiClient } from "../constant/api.ts";
import { API } from "../constant/config.ts";

const prefix = `${API}/SupportChat`;

export const apiGetMyChats = async (): Promise<any> => {
  const res = await apiClient.get(`${prefix}/my-chats`);
  return res?.data;
};

export const apiGetChatById = async (id: number): Promise<any> => {
  const res = await apiClient.get(`${prefix}/${id}`);
  return res?.data;
};

export const apiOpenChat = async (): Promise<any> => {
  const res = await apiClient.post(`${prefix}/open`);
  return res?.data;
};

export const apiSendMessage = async (data: {
  supportChatId: number;
  message: string;
}): Promise<any> => {
  const res = await apiClient.post(`${prefix}/send-message`, data);
  return res?.data;
};

export const apiCloseChat = async (id: number): Promise<any> => {
  const res = await apiClient.post(`${prefix}/${id}/close`);
  return res?.data;
};

export const apiGetMessages = async (id: number): Promise<any> => {
  const res = await apiClient.get(`${prefix}/${id}/messages`);
  return res?.data;
};

export const SupportChatService = {
  getMyChats: apiGetMyChats,
  getById: apiGetChatById,
  openChat: apiOpenChat,
  sendMessage: apiSendMessage,
  closeChat: apiCloseChat,
  getMessages: apiGetMessages,
};