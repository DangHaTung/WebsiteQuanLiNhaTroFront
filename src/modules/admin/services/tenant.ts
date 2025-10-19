import api from "./api";
import type { Tenant } from "../../../types/tenant";

interface TenantResponse {
  message: string;
  success: boolean;
  data: Tenant[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}

interface SingleTenantResponse {
  message: string;
  success: boolean;
  data: Tenant;
}

export const adminTenantService = {
  async getAll(params?: { page?: number; limit?: number; role?: string }): Promise<Tenant[]> {
    const res = await api.get<TenantResponse>("/users", { params: { ...params, role: "TENANT" } });
    return res.data.data;
  },

  async getById(id: string): Promise<Tenant> {
    const res = await api.get<SingleTenantResponse>(`/users/${id}`);
    return res.data.data;
  },

  async create(payload: Partial<Tenant>): Promise<Tenant> {
    const res = await api.post<SingleTenantResponse>("/users", { ...payload, role: "TENANT" });
    return res.data.data;
  },

  async update(id: string, payload: Partial<Tenant>): Promise<Tenant> {
    const res = await api.put<SingleTenantResponse>(`/users/${id}`, payload);
    return res.data.data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};

