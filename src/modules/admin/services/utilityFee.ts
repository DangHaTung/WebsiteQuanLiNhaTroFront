import api from "./api";

export interface ElectricityTier {
  min: number;
  max?: number;
  rate: number;
}

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

interface UtilityFeeResponse {
  success: boolean;
  message: string;
  data: UtilityFee[];
}

interface SingleUtilityFeeResponse {
  success: boolean;
  message: string;
  data: UtilityFee;
}

export const utilityFeeService = {
  async getAll(): Promise<UtilityFee[]> {
    const res = await api.get<UtilityFeeResponse>("/utility-fees");
    return res.data.data;
  },

  async getByType(type: string): Promise<UtilityFee> {
    const res = await api.get<SingleUtilityFeeResponse>(`/utility-fees/${type}`);
    return res.data.data;
  },

  async createOrUpdate(payload: Partial<UtilityFee>): Promise<UtilityFee> {
    const res = await api.post<SingleUtilityFeeResponse>("/utility-fees", payload);
    return res.data.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/utility-fees/${id}`);
    return res.data;
  },
};
