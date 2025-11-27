import api from "./api";

export interface Bill {
  _id: string;
  contractId?: string;
  finalContractId?: string;
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
