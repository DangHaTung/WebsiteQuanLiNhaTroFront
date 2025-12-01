import api from "./api";
// Interface cho tiền diện
export interface ElectricityTier {
  min: number;
  max?: number;
  rate: number;
}
// Interface cho tiền dịch vụ
export interface UtilityFee {
  _id: string;
  type: "electricity" | "water" | "internet" | "cleaning" | "parking";
  description?: string;
  baseRate: number;
  electricityTiers?: ElectricityTier[];
  vatPercent?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
// Interface cho phản hồi khi lấy nhiều tiền dịch vụ
interface UtilityFeeResponse {
  success: boolean;
  message: string;
  data: UtilityFee[];
}
// Interface cho phản hồi khi lấy một tiền dịch vụ
interface SingleUtilityFeeResponse {
  success: boolean;
  message: string;
  data: UtilityFee;
}
// Dịch vụ tiền dịch vụ
export const utilityFeeService = {
  async getAll(): Promise<UtilityFee[]> {
    const res = await api.get<UtilityFeeResponse>("/utility-fees");
    return res.data.data;
  },
// Lấy tiền dịch vụ theo loại
  async getByType(type: string): Promise<UtilityFee> {
    const res = await api.get<SingleUtilityFeeResponse>(`/utility-fees/${type}`);
    return res.data.data;
  },
// Tạo hoặc cập nhật tiền dịch vụ
  async createOrUpdate(payload: Partial<UtilityFee>): Promise<UtilityFee> {
    const res = await api.post<SingleUtilityFeeResponse>("/utility-fees", payload);
    return res.data.data;
  },
// Xóa tiền dịch vụ theo ID
  async delete(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/utility-fees/${id}`);
    return res.data;
  },
};
