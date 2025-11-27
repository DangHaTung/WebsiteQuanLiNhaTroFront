import api from "./api";

export type Complaint = {
  _id: string;
  tenantId: string;
  title: string;
  description: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Paginated<T> = {
  message: string;
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
};

export type CreateComplaintPayload = {
  tenantId: string;
  title: string;
  description: string;
};

export const complaintService = {
  async create(payload: CreateComplaintPayload) {
    const { data } = await api.post("/complaints", payload);
    return data as { message: string; success: boolean; data: Complaint };
  },

  async getByTenantId(tenantId: string, page = 1, limit = 10) {
    const { data } = await api.get(`/complaints/tenant/${tenantId}`, {
      params: { page, limit },
    });
    return data as Paginated<Complaint>;
  },

  async remove(id: string) {
    const { data } = await api.delete(`/complaints/${id}`);
    return data as { message: string; success: boolean };
  },
};
