import api from "./api";
import type { Tenant } from "../../../types/tenant";
// Interface cho phản hồi khi lấy nhiều tenant
interface TenantResponse {
  message: string;
  success: boolean;
  data: Tenant[];
  // Phân trang
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}
// Interface cho phản hồi khi lấy một tenant
interface SingleTenantResponse {
  message: string;
  success: boolean;
  data: Tenant;
}
// Dịch vụ quản lý tenant cho admin
export const adminTenantService = {
  async getAll(params?: { page?: number; limit?: number; role?: string }): Promise<Tenant[]> {
    const res = await api.get<TenantResponse>("/tennant", { params: { ...params } });
    return res.data.data;
  },
// Lấy tenant theo ID
  async getById(id: string): Promise<Tenant> {
    const res = await api.get<SingleTenantResponse>(`/users/${id}`);
    return res.data.data;
  },
// Tạo mới tenant
  async create(payload: Partial<Tenant>): Promise<Tenant> {
    const res = await api.post<SingleTenantResponse>("/users", { ...payload, role: "TENANT" });
    return res.data.data;
  },
// Cập nhật thông tin tenant
  async update(id: string, payload: Partial<Tenant>): Promise<Tenant> {
    const res = await api.put<SingleTenantResponse>(`/users/${id}`, payload);
    return res.data.data;
  },
// Xóa tenant theo ID
  async remove(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};

