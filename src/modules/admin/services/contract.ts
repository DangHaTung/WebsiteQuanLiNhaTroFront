// Import thư viện và kiểu dữ liệu cần thiết
import api from "./api";
import type { MoveOutRequest } from "../../client/services/moveOutRequest";

/**
 * Interface định nghĩa cấu trúc phản hồi khi lấy danh sách yêu cầu trả phòng
 * @property {boolean} success - Trạng thái thực hiện yêu cầu
 * @property {MoveOutRequest[]} data - Mảng các yêu cầu trả phòng
 */
interface MoveOutRequestsResponse {
  success: boolean;
  data: MoveOutRequest[];
}

/**
 * Interface định nghĩa cấu trúc phản hồi khi lấy thông tin 1 yêu cầu trả phòng
 * @property {boolean} success - Trạng thái thực hiện yêu cầu
 * @property {MoveOutRequest} data - Thông tin chi tiết yêu cầu trả phòng
 */
interface SingleMoveOutRequestResponse {
  success: boolean;
  data: MoveOutRequest;
}

/**
 * Dịch vụ quản lý yêu cầu trả phòng dành cho quản trị viên
 * Cung cấp các phương thức tương tác với API liên quan đến yêu cầu trả phòng
 */
export const adminMoveOutRequestService = {
  /**
   * Lấy danh sách tất cả yêu cầu trả phòng
   * @param {Object} [params] - Tham số tùy chọn để lọc và phân trang
   * @param {string} [params.status] - Lọc theo trạng thái (PENDING / APPROVED / REJECTED)
   * @returns {Promise<MoveOutRequest[]>} Mảng các yêu cầu trả phòng
   */
  async getAll(params?: { status?: string }): Promise<MoveOutRequest[]> {
    const res = await api.get<MoveOutRequestsResponse>("/move-out-requests", { params });
    return res.data.data;
  },

  /**
   * Cập nhật trạng thái của yêu cầu trả phòng
   * @param {string} id - ID của yêu cầu trả phòng cần cập nhật
   * @param {Object} data - Dữ liệu cập nhật
   * @param {'APPROVED'|'REJECTED'} data.status - Trạng thái mới của yêu cầu
   * @param {string} [data.adminNote] - Ghi chú của quản trị viên khi duyệt
   * @returns {Promise<MoveOutRequest>} Thông tin yêu cầu sau khi cập nhật
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
   * Thường được gọi sau khi đã xác nhận người thuê đã trả phòng và bàn giao đầy đủ
   * @param {string} id - ID của yêu cầu trả phòng
   * @returns {Promise<MoveOutRequest>} Thông tin yêu cầu sau khi cập nhật
   */
  async complete(id: string): Promise<MoveOutRequest> {
    const res = await api.put<SingleMoveOutRequestResponse>(`/move-out-requests/${id}/complete`);
    return res.data.data;
  },
};

/**
 * Dịch vụ quản lý hợp đồng dành cho quản trị viên
 * Cung cấp các phương thức tương tác với API liên quan đến hợp đồng
 */
export const adminContractService = {
  /**
   * Lấy danh sách tất cả hợp đồng
   * @param {Object} [params] - Tham số tùy chọn để phân trang và lọc
   * @param {number} [params.limit] - Số lượng bản ghi mỗi trang
   * @param {number} [params.page] - Số trang hiện tại
   * @returns {Promise<any[]>} Mảng các hợp đồng
   */
  async getAll(params?: { limit?: number; page?: number; [key: string]: any }): Promise<any[]> {
    const res = await api.get<{ success: boolean; data: any[] }>('/contracts', { params });
    return res.data.data;
  },

  /**
   * Lấy thông tin chi tiết của một hợp đồng theo ID
   * @param {string} id - ID của hợp đồng cần lấy
   * @returns {Promise<any>} Thông tin chi tiết hợp đồng
   */
  async getById(id: string): Promise<any> {
    const res = await api.get<{ success: boolean; data: any }>(`/contracts/${id}`);
    return res.data.data;
  }
};

// Xuất mặc định dịch vụ quản lý yêu cầu trả phòng
export default adminMoveOutRequestService;
