import api from "./api";
import type { MoveOutRequest } from "../../client/services/moveOutRequest";
// Interface cho phản hồi khi lấy nhiều yêu cầu chuyển đi
interface MoveOutRequestsResponse {
  success: boolean;
  data: MoveOutRequest[];
}
// Interface cho phản hồi khi lấy một yêu cầu chuyển đi
interface SingleMoveOutRequestResponse {
  success: boolean;
  data: MoveOutRequest;
}
// Dịch vụ quản lý yêu cầu chuyển đi cho admin
export const adminMoveOutRequestService = {
  async getAll(params?: { status?: string }): Promise<MoveOutRequest[]> {
    const res = await api.get<MoveOutRequestsResponse>("/move-out-requests", { params });
    return res.data.data;
  },
// Lấy yêu cầu chuyển đi theo ID
  async updateStatus(id: string, data: {
    status: "APPROVED" | "REJECTED";
    adminNote?: string;
  }): Promise<MoveOutRequest> {
    const res = await api.put<SingleMoveOutRequestResponse>(`/move-out-requests/${id}`, data);
    return res.data.data;
  },
// Hoàn tất yêu cầu chuyển đi
  async complete(id: string): Promise<MoveOutRequest> {
    const res = await api.put<SingleMoveOutRequestResponse>(`/move-out-requests/${id}/complete`);
    return res.data.data;
  },
};
// Xuất dịch vụ
export default adminMoveOutRequestService;

