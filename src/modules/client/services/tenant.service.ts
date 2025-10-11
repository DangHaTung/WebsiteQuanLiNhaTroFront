import api from "./api";

export interface Tenant {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
  identityNo?: string;
  note?: string;
  createdAt: string;
}

export interface CreateTenantRequest {
  fullName: string;
  phone?: string;
  email?: string;
  identityNo?: string;
  note?: string;
}

export interface UpdateTenantRequest {
  fullName?: string;
  phone?: string;
  email?: string;
  identityNo?: string;
  note?: string;
}

export interface TenantResponse {
  message: string;
  tenant: Tenant;
}

export const tenantService = {
  // Lấy danh sách tất cả tenants
  getAllTenants: async (): Promise<Tenant[]> => {
    const response = await api.get("/tenants/tennant");
    return response.data;
  },

  // Tạo tenant mới
  createTenant: async (data: CreateTenantRequest): Promise<TenantResponse> => {
    const response = await api.post("/tenants/tennant", data);
    return response.data;
  },

  // Cập nhật tenant
  updateTenant: async (id: string, data: UpdateTenantRequest): Promise<TenantResponse> => {
    const response = await api.put(`/tenants/tennant/${id}`, data);
    return response.data;
  },

  // Xóa tenant
  deleteTenant: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/tenants/tennant/${id}`);
    return response.data;
  },

  // Lấy thông tin tenant theo ID
  getTenantById: async (id: string): Promise<Tenant> => {
    const response = await api.get(`/tenants/tennant/${id}`);
    return response.data;
  },
};