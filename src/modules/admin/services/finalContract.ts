import api from "./api";

export interface FinalContract {
  _id: string;
  tenantId?: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
  };
  roomId: {
    _id: string;
    roomNumber: string;
    pricePerMonth: number;
    type?: string;
  };
  originContractId?: string;
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  pricingSnapshot?: {
    roomNumber: string;
    monthlyRent: number;
    deposit: number;
  };
  terms?: string;
  status: "DRAFT" | "WAITING_SIGN" | "SIGNED" | "CANCELED";
  images?: FileInfo[];
  cccdFiles?: FileInfo[];
  tenantSignedAt?: string;
  ownerApprovedAt?: string;
  finalizedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileInfo {
  url: string;
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;
  viewUrl?: string;
  downloadUrl?: string;
  inlineUrl?: string;
}

interface FinalContractResponse {
  message: string;
  success: boolean;
  data: FinalContract[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}

interface SingleFinalContractResponse {
  message: string;
  success: boolean;
  data: FinalContract;
}

export const adminFinalContractService = {
  async getAll(params?: { page?: number; limit?: number; status?: string; tenantId?: string; roomId?: string }): Promise<FinalContractResponse> {
    const res = await api.get<FinalContractResponse>("/final-contracts", { params });
    return res.data;
  },

  async getById(id: string): Promise<FinalContract> {
    const res = await api.get<SingleFinalContractResponse>(`/final-contracts/public/${id}`);
    return res.data.data;
  },

  async createFromContract(payload: { contractId: string; terms?: string; tenantId?: string }): Promise<FinalContract> {
    const res = await api.post<SingleFinalContractResponse>("/final-contracts", payload);
    return res.data.data;
  },

  async uploadFiles(id: string, files: File[]): Promise<FinalContract> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const res = await api.post<SingleFinalContractResponse>(`/final-contracts/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  async uploadCCCD(id: string, files: File[]): Promise<FinalContract> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const res = await api.post<SingleFinalContractResponse>(`/final-contracts/${id}/upload-cccd`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  async deleteFile(id: string, type: "images" | "cccdFiles", index: number): Promise<void> {
    await api.delete(`/final-contracts/${id}/files/${type}/${index}`);
  },

  async assignTenant(id: string, tenantId: string): Promise<FinalContract> {
    const res = await api.put<SingleFinalContractResponse>(`/final-contracts/${id}/assign-tenant`, { tenantId });
    return res.data.data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/final-contracts/${id}`);
    return res.data;
  },

  async getRemainingAmount(id: string): Promise<{ remaining: number }> {
    const res = await api.get<{ success: boolean; data: { remaining: number } }>(`/final-contracts/${id}/remaining`);
    return res.data.data;
  },

  async cancel(id: string): Promise<FinalContract> {
    const res = await api.put<SingleFinalContractResponse>(`/final-contracts/${id}/cancel`);
    return res.data.data;
  },
};
