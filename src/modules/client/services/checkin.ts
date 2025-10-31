import api from "./api";

export const clientCheckinService = {
  createCashCheckin: async (data: {
    roomId: string;
    checkinDate: string;
    duration: number;
    deposit: number;
    notes?: string;
  }) => {
    const res = await api.post("/checkin/cash", data);
    return res.data;
  },

  // Tạo payment và lấy URL redirect VNPay
  createPayment: async (data: {
    billId: string;
    amount: number;
    bankCode?: string;
  }) => {
    const res = await api.post("/payment/vnpay/create", data);
    return res.data;
  },

  // Xử lý VNPay return (redirect từ cổng VNPay)
  vnPayReturn: async (query: Record<string, any>) => {
    const params = new URLSearchParams(query).toString();
    const res = await api.get(`/payment/vnpay/return?${params}`);
    return res.data;
  },
};
