import api from "./api";
import type { Tenant } from "../../../types/tenant";

export interface CreateTenantData {
  fullName: string;
  phone: string;
  email: string;
  identityNo: string;
  password?: string;
}

export const clientTenantService = {
  // Tạo tenant mới khi đặt phòng
  create: async (data: CreateTenantData) => {
    const response = await api.post("/tennant", data);
    return response.data;
  },

  // Cập nhật thông tin tenant (thêm CCCD/CMND)
  update: async (id: string, data: Partial<CreateTenantData>) => {
    const response = await api.put(`/tennant/${id}`, data);
    return response.data;
  },

  // Lấy thông tin tenant của mình
  getMyTenant: async () => {
    const response = await api.get(`/tennant/my-tenant`);
    return response.data;
  },

  // Lấy thông tin tenant theo ID (admin only)
  getById: async (id: string) => {
    const response = await api.get(`/tennant/${id}`);
    return response.data;
  },
};
