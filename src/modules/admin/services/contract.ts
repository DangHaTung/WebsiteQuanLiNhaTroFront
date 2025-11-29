import api from "./api";
import type { MoveOutRequest } from "../../client/services/moveOutRequest";

/**
 * Response chứa danh sách yêu cầu trả phòng
 */
interface MoveOutRequestsResponse {
  success: boolean;
  data: MoveOutRequest[];
}

/**
 * Response chứa 1 yêu cầu trả phòng
 */
interface SingleMoveOutRequestResponse {
  success: boolean;
  data: MoveOutRequest;
}

/**
 * Service dành cho Admin để quản lý yêu cầu trả phòng
 */
export const adminMoveOutRequestService = {

  /**
   * Lấy danh sách yêu cầu trả phòng
   * Có thể truyền params để lọc theo trạng thái (PENDING / APPROVED / REJECTED ...)
   */
  async getAll(params?: { status?: string }): Promise<MoveOutRequest[]> {
    const res = await api.get<MoveOutRequestsResponse>("/move-out-requests", { params });
    return res.data.data;
  },

  /**
   * Admin cập nhật trạng thái của yêu cầu trả phòng
   * - "APPROVED": chấp nhận cho trả phòng
   * - "REJECTED": từ chối
   * adminNote: ghi chú của admin khi duyệt
   */
  async updateStatus(
    id: string,
    data: {
      status: "APPROVED" | "REJECTED";
      adminNote?: string;
    }
  ): Promise<MoveOutRequest> {
    const res = await api.put<SingleMoveOutRequestResponse>(`/move-out-requests/${id}`, data);
    return res.data.data;
  },

  /**
   * Đánh dấu yêu cầu trả phòng đã hoàn tất
   * Thường được gọi khi người thuê đã trả phòng và bàn giao xong
   */
  async complete(id: string): Promise<MoveOutRequest> {
    const res = await api.put<SingleMoveOutRequestResponse>(`/move-out-requests/${id}/complete`);
    return res.data.data;
  },
};

export default adminMoveOutRequestService;
