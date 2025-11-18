import api from "./api";
import type { Checkin } from "../../../types/checkin";

interface CheckinResponse {
  success: boolean;
  message: string;
  data: Checkin[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}

interface SingleCheckinResponse {
  success: boolean;
  message: string;
  data: {
    checkinId: string;
    contractId: string;
    receiptBillId: string;
  };
}

interface CashCheckinPayload {
  roomId: string;
  checkinDate: string;
  duration: number;
  deposit: number;
  notes?: string;
  fullName: string;
  phone: string;
  identityNo?: string;
  address?: string;
  tenantNote?: string;
  tenantId?: string;
}

interface PrintDataResponse {
  success: boolean;
  message: string;
  data: {
    documentType: string;
    checkinId: string;
    createdAt: string;
    tenant: {
      fullName: string;
      phone: string;
      identityNo: string;
      address: string;
      note: string;
    };
    room: {
      roomNumber: string;
      floor: number | null;
      areaM2: number | null;
    };
    dates: {
      checkinDate: string;
      startDate: string;
      endDate: string;
    };
    pricing: {
      deposit: number;
      monthlyRent: number;
    };
    organization: {
      name: string;
      address: string;
      phone: string;
    };
  };
}

export const adminCheckinService = {
  // Tạo check-in thanh toán tiền mặt
  async createCash(payload: CashCheckinPayload): Promise<SingleCheckinResponse> {
    const res = await api.post<SingleCheckinResponse>("/checkin/cash", payload);
    return res.data;
  },

  // Tạo check-in thanh toán online
  async createOnline(payload: CashCheckinPayload): Promise<SingleCheckinResponse> {
    const res = await api.post<SingleCheckinResponse>("/checkin/online", payload);
    return res.data;
  },

  // Lấy danh sách check-in (cần thêm API backend)
  async getAll(params?: { page?: number; limit?: number; status?: string }): Promise<CheckinResponse> {
    const res = await api.get<CheckinResponse>("/checkins", { params });
    return res.data;
  },

  // Lấy dữ liệu in hợp đồng mẫu
  async getPrintData(id: string): Promise<PrintDataResponse> {
    const res = await api.get<PrintDataResponse>(`/checkins/${id}/print-data`);
    return res.data;
  },

  // Tải file DOCX hợp đồng mẫu
  async downloadSampleDocx(id: string): Promise<Blob> {
    const res = await api.get(`/checkins/${id}/sample-docx`, {
      responseType: "blob",
    });
    return res.data;
  },

  // Hủy check-in
  async cancel(id: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const res = await api.post(`/checkins/${id}/cancel`, { reason });
    return res.data;
  },

  // Đánh dấu hoàn thành
  async complete(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.put(`/checkins/${id}/complete`, {});
    return res.data;
  },
};
