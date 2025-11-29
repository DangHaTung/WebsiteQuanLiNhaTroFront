import api from "./api";

/**
 * Interface hợp đồng cuối (FinalContract)
 * Đây là thông tin hợp đồng sau khi đã được chốt chính thức
 */
export interface FinalContract {
  _id: string;

  // Thông tin người thuê (có thể undefined nếu chưa gán)
  tenantId?: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
  };

  // Thông tin phòng thuê
  roomId: {
    _id: string;
    roomNumber: string;
    pricePerMonth: number;
    type?: string;
  };

  // ID hợp đồng gốc (nếu hợp đồng này được tạo từ hợp đồng nháp)
  originContractId?: string;

  // Ngày bắt đầu - ngày kết thúc hợp đồng
  startDate: string;
  endDate: string;

  // Tiền đặt cọc
  deposit: number;

  // Tiền thuê theo tháng
  monthlyRent: number;

  // Snapshot giá tại thời điểm ký hợp đồng
  pricingSnapshot?: {
    roomNumber: string;
    monthlyRent: number;
    deposit: number;
  };

  // Điều khoản hợp đồng
  terms?: string;

  // Trạng thái hợp đồng
  status: "DRAFT" | "WAITING_SIGN" | "SIGNED" | "CANCELED";

  // Danh sách file ảnh / tài liệu đính kèm
  images?: FileInfo[];

  // Mốc thời gian ký của người thuê - chủ trọ - hoàn tất
  tenantSignedAt?: string;
  ownerApprovedAt?: string;
  finalizedAt?: string;

  createdAt: string;
  updatedAt: string;
}

/**
 * Thông tin file tải lên (ảnh/tài liệu)
 */
export interface FileInfo {
  url: string;
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;

  // Các link hỗ trợ xem/tải file
  viewUrl?: string;
  downloadUrl?: string;
  inlineUrl?: string;
}

/**
 * Response cho danh sách hợp đồng
 */
interface FinalContractResponse {
  message: string;
  success: boolean;
  data: FinalContract[];

  // Phân trang
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}

/**
 * Response cho 1 hợp đồng
 */
interface SingleFinalContractResponse {
  message: string;
  success: boolean;
  data: FinalContract;
}

/**
 * Service quản lý hợp đồng cuối dành cho admin
 */
export const adminFinalContractService = {

  /**
   * Lấy danh sách hợp đồng cuối
   * Có thể truyền page, limit, status, tenantId, roomId để lọc
   */
  async getAll(params?: { page?: number; limit?: number; status?: string; tenantId?: string; roomId?: string }): Promise<FinalContractResponse> {
    const res = await api.get<FinalContractResponse>("/final-contracts", { params });
    return res.data;
  },

  /**
   * Lấy chi tiết hợp đồng công khai theo ID
   */
  async getById(id: string): Promise<FinalContract> {
    const res = await api.get<SingleFinalContractResponse>(`/final-contracts/public/${id}`);
    return res.data.data;
  },

  /**
   * Tạo hợp đồng cuối từ hợp đồng nháp
   */
  async createFromContract(payload: { contractId: string; terms?: string; tenantId?: string }): Promise<FinalContract> {
    const res = await api.post<SingleFinalContractResponse>("/final-contracts", payload);
    return res.data.data;
  },

  /**
   * Upload file (hình ảnh/tài liệu) lên hợp đồng
   */
  async uploadFiles(id: string, files: File[]): Promise<FinalContract> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await api.post<SingleFinalContractResponse>(`/final-contracts/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.data;
  },

  /**
   * Xóa file của hợp đồng theo index
   * type: "images"
   */
  async deleteFile(id: string, type: "images", index: number): Promise<void> {
    await api.delete(`/final-contracts/${id}/files/${type}/${index}`);
  },

  /**
   * Gán người thuê vào hợp đồng
   */
  async assignTenant(id: string, tenantId: string): Promise<FinalContract> {
    const res = await api.put<SingleFinalContractResponse>(`/final-contracts/${id}/assign-tenant`, { tenantId });
    return res.data.data;
  },

  /**
   * Xóa hợp đồng cuối
   */
  async remove(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/final-contracts/${id}`);
    return res.data;
  },

  /**
   * Lấy số tiền còn lại chưa thanh toán
   */
  async getRemainingAmount(id: string): Promise<{ remaining: number }> {
    const res = await api.get<{ success: boolean; data: { remaining: number } }>(`/final-contracts/${id}/remaining`);
    return res.data.data;
  },

  /**
   * Hủy hợp đồng cuối
   */
  async cancel(id: string): Promise<FinalContract> {
    const res = await api.put<SingleFinalContractResponse>(`/final-contracts/${id}/cancel`);
    return res.data.data;
  },

  /**
   * Gia hạn hợp đồng
   * extensionMonths: số tháng gia hạn thêm
   */
  async extend(id: string, extensionMonths: number): Promise<{ finalContract: FinalContract; extension: any }> {
    const res = await api.put<{ success: boolean; message: string; data: { finalContract: FinalContract; extension: any } }>(
      `/final-contracts/${id}/extend`,
      { extensionMonths }
    );
    return res.data.data;
  },

  /**
   * Lấy danh sách hợp đồng sắp hết hạn trong X ngày
   */
  async getExpiringSoon(days: number = 30): Promise<FinalContract[]> {
    const res = await api.get<{ success: boolean; data: FinalContract[]; count: number }>(
      `/final-contracts/expiring-soon`,
      { params: { days } }
    );
    return res.data.data;
  },
};
