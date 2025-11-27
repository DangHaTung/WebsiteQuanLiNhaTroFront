import api from "./api";
import type { MoveOutRequest } from "../../client/services/moveOutRequest";

interface MoveOutRequestsResponse {
  success: boolean;
  data: MoveOutRequest[];
}

interface SingleMoveOutRequestResponse {
  success: boolean;
  data: MoveOutRequest;
}

export const adminMoveOutRequestService = {
  async getAll(params?: { status?: string }): Promise<MoveOutRequest[]> {
    const res = await api.get<MoveOutRequestsResponse>("/move-out-requests", { params });
    return res.data.data;
  },

  async updateStatus(id: string, data: {
    status: "APPROVED" | "REJECTED";
    adminNote?: string;
  }): Promise<MoveOutRequest> {
    const res = await api.put<SingleMoveOutRequestResponse>(`/move-out-requests/${id}`, data);
    return res.data.data;
  },

  async complete(id: string): Promise<MoveOutRequest> {
    const res = await api.put<SingleMoveOutRequestResponse>(`/move-out-requests/${id}/complete`);
    return res.data.data;
  },
};

export default adminMoveOutRequestService;

