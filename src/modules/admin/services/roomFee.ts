import api from "./api";

export interface RoomFee {
  _id: string;
  roomId: string;
  appliedTypes: string[];
  feeRefs: Record<string, string>;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeeCalculation {
  roomId: string;
  breakdown: Array<{
    type: string;
    kwh?: number;
    baseRate?: number;
    occupantCount?: number;
    subtotal?: number;
    vat?: number;
    total: number;
  }>;
  total: number;
}

interface RoomFeeResponse {
  success: boolean;
  message: string;
  data: RoomFee;
}

interface FeeCalculationResponse {
  success: boolean;
  message: string;
  data: FeeCalculation;
}

export const roomFeeService = {
  async assignFees(roomId: string, appliedTypes: string[]): Promise<RoomFee> {
    const res = await api.post<RoomFeeResponse>(`/rooms/${roomId}/fees`, { appliedTypes });
    return res.data.data;
  },

  async getRoomFees(roomId: string): Promise<RoomFee> {
    const res = await api.get<RoomFeeResponse>(`/rooms/${roomId}/fees`);
    return res.data.data;
  },

  async calculateFees(roomId: string, kwh: number, occupantCount: number): Promise<FeeCalculation> {
    const res = await api.post<FeeCalculationResponse>(`/rooms/${roomId}/fees/calculate`, { kwh, occupantCount });
    return res.data.data;
  },
};
