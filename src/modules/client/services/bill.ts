import api from "./api";

export interface Bill {
  _id: string;
  contractId?: string | {
    _id?: string;
    tenantId?: string | { _id?: string; fullName?: string };
    coTenants?: Array<{
      userId?: string | { _id?: string };
      status?: string;
    }>;
  };
  finalContractId?: string;
  tenantId?: string | { _id?: string; fullName?: string };
  billingDate: string;
  dueDate?: string;
  billType: "RECEIPT" | "CONTRACT" | "MONTHLY";
  status: "PAID" | "UNPAID" | "PENDING_CASH_CONFIRM" | "PARTIALLY_PAID";
  lineItems: Array<{
    item: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  amountDue: number;
  amountPaid: number;
  // Thông tin số điện (để hiển thị chi tiết trong hóa đơn)
  electricityReading?: {
    previous?: number; // Số điện cũ (kỳ trước)
    current?: number;  // Số điện mới (kỳ này)
    consumption?: number; // Số điện tiêu thụ
  };
  // Thông tin xe
  vehicles?: Array<{
    type: 'motorbike' | 'electric_bike' | 'bicycle';
    licensePlate?: string;
  }>;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const clientBillService = {
  async getMyBills(params?: { page?: number; limit?: number }): Promise<{ data: Bill[]; pagination: any }> {
    const { data } = await api.get("/bills/my-bills", { params });
    return data;
  },

  async getById(id: string): Promise<Bill> {
    const { data } = await api.get(`/bills/public/${id}`);
    return data.data;
  },

  async getPendingPayment(): Promise<Bill[]> {
    const { data } = await api.get("/bills/pending-payment");
    return data.data || [];
  },

  async getBillsByFinalContract(finalContractId: string): Promise<Bill[]> {
    const { data } = await api.get(`/bills/final-contract/${finalContractId}`);
    return data.data || [];
  },
};
