import api from "./api";

export type Complaint = {
  _id: string;
  tenantId: string | { _id: string; fullName?: string; phone?: string; email?: string };
  createdBy?: { _id: string; fullName?: string; email?: string; phone?: string } | string;
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

export const adminComplaintService = {
  async list(page = 1, limit = 10) {
    const { data } = await api.get("/admin/complaints", { params: { page, limit } });
    return data as Paginated<Complaint>;
  },

  async updateStatus(id: string, status: string) {
    const { data } = await api.put(`/admin/complaints/${id}/status`, { status });
    return data as { message: string; success: boolean; data: Complaint };
  },

  async remove(id: string) {
    const { data } = await api.delete(`/admin/complaints/${id}`);
    return data as { message: string; success: boolean };
  },
};
