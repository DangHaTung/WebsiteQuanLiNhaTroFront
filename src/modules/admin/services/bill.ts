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
  async getAll(params?: { page?: number; limit?: number; status?: string; billType?: string; contractId?: string; finalContractId?: string }): Promise<Bill[]> {
    const res = await api.get<BillResponse>("/bills", { params });
    return res.data.data;
  },

  async getDrafts(params?: { page?: number; limit?: number }): Promise<Bill[]> {
    const res = await api.get<BillResponse>("/bills/drafts", { params });
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

  async publishDraft(id: string, payload: { electricityKwh: number; waterM3?: number; occupantCount?: number; vehicleCount?: number }): Promise<Bill> {
    const res = await api.put<SingleBillResponse>(`/bills/${id}/publish`, payload);
    return res.data.data;
  },

  async publishBatch(bills: Array<{ billId: string; electricityKwh: number; occupantCount?: number; vehicleCount?: number }>): Promise<any> {
    const res = await api.post("/bills/publish-batch", { bills });
    return res.data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/bills/${id}`);
    return res.data;
  },

  async confirmCashPayment(id: string): Promise<Bill> {
    const res = await api.post<SingleBillResponse>(`/bills/${id}/confirm-cash`, {});
    return res.data.data;
  },

  async confirmPayment(id: string): Promise<Bill> {
    const res = await api.post<SingleBillResponse>(`/bills/${id}/confirm-payment`, {});
    return res.data.data;
  },

  async getByContractId(contractId: string): Promise<Bill[]> {
    const res = await api.get<BillResponse>(`/bills?contractId=${contractId}`);
    return res.data.data;
  },

  async generatePaymentLink(billId: string, email?: string): Promise<{ paymentUrl: string; token: string; expiresAt: string; emailSent: boolean; recipientEmail: string }> {
    const res = await api.post(`/bills/${billId}/generate-payment-link`, email ? { email } : {});
    return res.data.data;
  },
};

// Tenant bill service
export const tenantBillService = {
  async getPendingPayment(): Promise<Bill[]> {
    const res = await api.get<BillResponse>("/public/bills/pending-payment");
    return res.data.data;
  },

  async getMyBills(params?: { page?: number; limit?: number }): Promise<Bill[]> {
    const res = await api.get<BillResponse>("/public/bills/my-bills", { params });
    return res.data.data;
  },

  async getByFinalContractId(finalContractId: string): Promise<Bill[]> {
    const res = await api.get<BillResponse>(`/bills/final-contract/${finalContractId}`);
    return res.data.data;
  },
};
