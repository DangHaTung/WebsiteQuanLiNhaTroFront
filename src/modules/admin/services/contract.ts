import api from "./api";
import type { Contract } from "../../../types/contract";

interface ContractsResponse {
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
  success: boolean;
  data: Contract;
}

export const adminContractService = {
  async getAll(params?: { page?: number; limit?: number; status?: string }): Promise<Contract[]> {
    const res = await api.get<ContractsResponse>("/contracts", { params });
    return res.data.data;
  },

  async getById(id: string): Promise<Contract> {
    const res = await api.get<SingleContractResponse>(`/contracts/${id}`);
    return res.data.data;
  },

  async create(data: Partial<Contract>): Promise<Contract> {
    const res = await api.post<SingleContractResponse>("/contracts", data);
    return res.data.data;
  },

  async update(id: string, data: Partial<Contract>): Promise<Contract> {
    const res = await api.put<SingleContractResponse>(`/contracts/${id}`, data);
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/contracts/${id}`);
  },

  async refundDeposit(id: string, data: {
    method: string;
    transactionId?: string;
    note?: string;
  }): Promise<Contract> {
    const res = await api.post<SingleContractResponse>(`/contracts/${id}/refund-deposit`, data);
    return res.data.data;
  },
};

export default adminContractService;
