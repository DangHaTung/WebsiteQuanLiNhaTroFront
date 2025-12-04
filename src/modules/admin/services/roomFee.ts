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

export interface Vehicle {
  type: 'motorbike' | 'electric_bike' | 'bicycle';
  licensePlate?: string;
}

export interface FeeCalculation {
  roomId: string;
  breakdown: Array<{
    type: string;
    kwh?: number;
    baseRate?: number;
    occupantCount?: number;
    vehicleCount?: number;
    vehicles?: Array<{
      type: string;
      count: number;
      rate: number;
      total: number;
      plates?: string[];
    }>;
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

  async calculateFees(
    roomId: string, 
    kwh: number, 
    occupantCount: number, 
    vehicleCount: number = 0,
    vehicles: Vehicle[] = []
  ): Promise<FeeCalculation> {
    const payload = { kwh, occupantCount, vehicleCount, vehicles };
    console.log(`[roomFeeService] calculateFees: payload=`, payload);
    const res = await api.post<FeeCalculationResponse>(`/rooms/${roomId}/fees/calculate`, payload);
    console.log(`[roomFeeService] calculateFees: response=`, res.data);
    return res.data.data;
  },
};
