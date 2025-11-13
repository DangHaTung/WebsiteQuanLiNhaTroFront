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

  // Tạo payment MoMo
  createMomoPayment: async (data: {
    billId: string;
    amount: number;
    orderInfo?: string;
  }) => {
    const res = await api.post("/payment/momo/create", data);
    return res.data;
  },

  // Tạo payment ZaloPay
  createZaloPayment: async (data: {
    billId: string;
  }) => {
    const res = await api.post("/payment/zalopay/create", data);
    return res.data;
  },
};
