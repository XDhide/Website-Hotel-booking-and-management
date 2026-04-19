import { apiClient } from "../constant/api.ts";
import { API } from "../constant/config.ts";

const prefix = `${API}/SupportChat`;

// GET MY CHATS
export const apiGetMyChats = async (): Promise<any> => {
  const res = await apiClient.get(`${prefix}/my-chats`);
  return res?.data;
};

// GET CHAT BY ID
export const apiGetChatById = async (id: number): Promise<any> => {
  const res = await apiClient.get(`${prefix}/${id}`);
  return res?.data;
};

// OPEN CHAT
export const apiOpenChat = async (): Promise<any> => {
  const res = await apiClient.post(`${prefix}/open`);
  return res?.data;
};

// SEND MESSAGE
export const apiSendMessage = async (data: {
  supportChatId: number;
  message: string;
}): Promise<any> => {
  const res = await apiClient.post(`${prefix}/send-message`, data);
  return res?.data;
};

// CLOSE CHAT
export const apiCloseChat = async (id: number): Promise<any> => {
  const res = await apiClient.post(`${prefix}/${id}/close`);
  return res?.data;
};

// GET MESSAGES
export const apiGetMessages = async (id: number): Promise<any> => {
  const res = await apiClient.get(`${prefix}/${id}/messages`);
  return res?.data;
};

// SERVICE (optional)
export const SupportChatService = {
  getMyChats: apiGetMyChats,
  getById: apiGetChatById,
  openChat: apiOpenChat,
  sendMessage: apiSendMessage,
  closeChat: apiCloseChat,
  getMessages: apiGetMessages,
};