import api from "./api";
import type { Contract } from "../../../types/contract";

interface ContractResponse {
  message: string;
  success: boolean;
  data: Contract[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}

interface SingleContractResponse {
  message: string;
  success: boolean;
  data: Contract;
}

export const adminContractService = {
  async getAll(params?: { page?: number; limit?: number }): Promise<Contract[]> {
    const res = await api.get<ContractResponse>("/contracts", { params });
    return res.data.data;
  },

  async getById(id: string): Promise<Contract> {
    const res = await api.get<SingleContractResponse>(`/contracts/${id}`);
    return res.data.data;
  },

  async create(payload: Partial<Contract>): Promise<Contract> {
    const res = await api.post<SingleContractResponse>("/contracts", payload);
    return res.data.data;
  },

  async update(id: string, payload: Partial<Contract>): Promise<Contract> {
    const res = await api.put<SingleContractResponse>(`/contracts/${id}`, payload);
    return res.data.data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/contracts/${id}`);
    return res.data;
  },
};

