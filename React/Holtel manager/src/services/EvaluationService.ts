import { apiClient } from "../constant/api";
import { API } from "../constant/config";

const prefix = `${API}/evaluation`;

export interface CreateEvaluationDto {
  userId: string;
  roomUseId: number;
  rating: number;
  comment: string;
}

export interface EvaluationDto {
  evaluationId: number;
  userId: string;
  roomUseId: number;
  rating: number | null;
  comment: string;
  createdAt: string | null;
}


export const apiGetAllEvaluations = async (
  page = 1,
  limit = 10
): Promise<any> => {
  try {
    const res = await apiClient.get(`${prefix}?page=${page}&limit=${limit}`);
    return res?.data;
  } catch (err: any) {
    console.error("[EvaluationService.getAll]", err);
    return { page, limit, totalCount: 0, totalPages: 0, data: [] };
  }
};


export const apiGetEvaluationById = async (
  id: number
): Promise<EvaluationDto | null> => {
  try {
    const res = await apiClient.get(`${prefix}/${id}`);
    return res?.data ?? null;
  } catch (err: any) {
    console.error("[EvaluationService.getById]", err);
    return null;
  }
};


export const apiCreateEvaluation = async (
  data: CreateEvaluationDto
): Promise<EvaluationDto> => {
  const res = await apiClient.post(`${prefix}/user-submit`, data);
  return res?.data;
};


export const apiUpdateEvaluation = async (
  id: number,
  data: Partial<CreateEvaluationDto>
): Promise<EvaluationDto | null> => {
  try {
    const res = await apiClient.put(`${prefix}/${id}`, data);
    return res?.data ?? null;
  } catch (err: any) {
    console.error("[EvaluationService.update]", err);
    return null;
  }
};


export const apiDeleteEvaluation = async (
  id: number
): Promise<boolean> => {
  try {
    await apiClient.delete(`${prefix}/${id}`);
    return true;
  } catch (err: any) {
    console.error("[EvaluationService.delete]", err);
    return false;
  }
};


export const apiGetMyEvaluations = async (): Promise<EvaluationDto[]> => {
  try {
    const res = await apiClient.get(`${prefix}/my-evaluations`);
    const data = res?.data;
    return Array.isArray(data) ? data : [];
  } catch (err: any) {
    console.error("[EvaluationService.getMyEvaluations]", err);
    return [];
  }
};

export const EvaluationService = {
  getAll: apiGetAllEvaluations,
  getById: apiGetEvaluationById,
  create: apiCreateEvaluation,
  update: apiUpdateEvaluation,
  delete: apiDeleteEvaluation,
  getMyEvaluations: apiGetMyEvaluations,
};
