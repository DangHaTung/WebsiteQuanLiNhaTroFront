import api from "./api";
import type { Bill } from "../../../types/bill";

interface BillResponse {
  message: string;
  success: boolean;
  data: Bill[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}

interface SingleBillResponse {
  message: string;
  success: boolean;
  data: Bill;
}

export const adminBillService = {
  async getAll(params?: { page?: number; limit?: number }): Promise<Bill[]> {
    const res = await api.get<BillResponse>("/bills", { params });
    return res.data.data;
  },

  async getById(id: string): Promise<Bill> {
    const res = await api.get<SingleBillResponse>(`/bills/${id}`);
    return res.data.data;
  },

  async create(payload: Partial<Bill>): Promise<Bill> {
    const res = await api.post<SingleBillResponse>("/bills", payload);
    return res.data.data;
  },

  async update(id: string, payload: Partial<Bill>): Promise<Bill> {
    const res = await api.put<SingleBillResponse>(`/bills/${id}`, payload);
    return res.data.data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/bills/${id}`);
    return res.data;
  },
};

