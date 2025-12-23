import api from "./api";

export interface MoveOutRequest {
  _id: string;
  contractId: {
    _id: string;
    deposit: number;
    depositRefund?: {
      amount: number;
      refundedAt?: string;
      method?: string;
      transactionId?: string;
      note?: string;
      damageAmount?: number;
      damageNote?: string;
      finalMonthServiceFee?: number;
      initialDeposit?: number; // Tiền cọc ban đầu (1 tháng tiền phòng)
    };
    depositRefunded?: boolean;
    startDate?: string;
    endDate?: string;
  };
  roomId: {
    _id: string;
    roomNumber: string;
  };
  tenantId: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  requestedAt: string;
  moveOutDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "WAITING_CONFIRMATION" | "COMPLETED";
  adminNote?: string;
  processedBy?: {
    _id: string;
    fullName: string;
  };
  processedAt?: string;
  refundProcessed: boolean;
  refundedAt?: string; // Thời gian admin hoàn cọc
  refundConfirmed?: boolean;
  refundConfirmedAt?: string;
  refundQrCode?: {
    url?: string;
    secure_url?: string;
    public_id?: string;
    resource_type?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface MoveOutRequestsResponse {
  success: boolean;
  data: MoveOutRequest[];
}

interface SingleMoveOutRequestResponse {
  success: boolean;
  data: MoveOutRequest;
}

export const clientMoveOutRequestService = {
  async create(data: {
    contractId: string;
    moveOutDate: string;
    reason: string;
  }): Promise<MoveOutRequest> {
    const res = await api.post<SingleMoveOutRequestResponse>("/move-out-requests", data);
    return res.data.data;
  },

  async getMyRequests(): Promise<MoveOutRequest[]> {
    const res = await api.get<MoveOutRequestsResponse>("/move-out-requests/my");
    return res.data.data;
  },

  async confirmRefund(id: string): Promise<MoveOutRequest> {
    const res = await api.put<SingleMoveOutRequestResponse>(`/move-out-requests/${id}/confirm-refund`);
    return res.data.data;
  },
};

export default clientMoveOutRequestService;

