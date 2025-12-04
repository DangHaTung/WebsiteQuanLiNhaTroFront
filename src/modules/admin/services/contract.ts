import api from "./api";

/**
 * Response chứa danh sách hợp đồng
 */
interface ContractsResponse {
  success: boolean;
  data: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Response chứa 1 hợp đồng
 */
interface SingleContractResponse {
  success: boolean;
  data: any;
}

/**
 * Service dành cho Admin để quản lý hợp đồng
 */
export const adminContractService = {
  /**
   * Lấy danh sách hợp đồng
   * Có thể truyền params để lọc theo trạng thái, phân trang
   */
  async getAll(params?: { 
    status?: string; 
    limit?: number; 
    page?: number;
  }): Promise<any[]> {
    const res = await api.get<ContractsResponse>("/contracts", { params });
    return res.data.data;
  },

  /**
   * Lấy thông tin hợp đồng theo ID
   */
  async getById(id: string): Promise<any> {
    const res = await api.get<SingleContractResponse>(`/contracts/${id}`);
    return res.data.data;
  },

  /**
   * Tạo hợp đồng mới
   */
  async create(data: any): Promise<any> {
    const res = await api.post<SingleContractResponse>("/contracts", data);
    return res.data.data;
  },

  /**
   * Cập nhật hợp đồng
   */
  async update(id: string, data: any): Promise<any> {
    const res = await api.put<SingleContractResponse>(`/contracts/${id}`, data);
    return res.data.data;
  },

  /**
   * Xóa hợp đồng
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/contracts/${id}`);
  },

  /**
   * Hoàn tiền cọc khi hợp đồng kết thúc
   */
  async refundDeposit(
    id: string,
    data: {
      electricityKwh?: number;
      waterM3?: number;
      occupantCount?: number;
      vehicleCount?: number;
      vehicles?: Array<{ type: string; licensePlate?: string }>; // Danh sách xe chi tiết từ check-in
      damageAmount?: number;
      damageNote?: string;
      method?: string;
      note?: string;
    }
  ): Promise<any> {
    const res = await api.post<SingleContractResponse>(
      `/contracts/${id}/refund-deposit`,
      data
    );
    return res.data.data;
  },

  /**
   * Lấy dữ liệu để in hợp đồng
   */
  async getPrintData(id: string): Promise<any> {
    const res = await api.get<SingleContractResponse>(
      `/contracts/${id}/print-data`
    );
    return res.data.data;
  },
};

export default adminContractService;
