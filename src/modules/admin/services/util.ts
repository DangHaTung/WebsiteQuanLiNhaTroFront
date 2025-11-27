import api from "./api";

export type UtilityType =
  | "refrigerator"
  | "air_conditioner"
  | "washing_machine"
  | "television"
  | "microwave"
  | "water_heater"
  | "fan"
  | "bed"
  | "wardrobe"
  | "desk"
  | "chair"
  | "sofa"
  | "wifi_router"
  | "other";

export type UtilityCondition = "new" | "used" | "broken";

export interface Util {
  _id: string;
  name: UtilityType;
  condition: UtilityCondition;
  description?: string;
  isActive: boolean;
  room?: string | { _id: string; roomNumber: string; type: string; status: string };
  createdAt?: string;
  updatedAt?: string;
}

interface UtilResponse {
  success: boolean;
  message: string;
  data: Util[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}

interface SingleUtilResponse {
  success: boolean;
  message: string;
  data: Util;
}

export const utilService = {
  async getAll(params?: { name?: string; condition?: string; room?: string; page?: number; limit?: number }): Promise<Util[]> {
    const res = await api.get<UtilResponse>("/utils", { params });
    return res.data.data;
  },

  async getById(id: string): Promise<Util> {
    const res = await api.get<SingleUtilResponse>(`/utils/${id}`);
    return res.data.data;
  },

  async getByRoom(roomId: string): Promise<Util[]> {
    const res = await api.get<UtilResponse>(`/rooms/${roomId}/utils`);
    return res.data.data;
  },

  async getBroken(params?: { page?: number; limit?: number }): Promise<Util[]> {
    const res = await api.get<UtilResponse>("/utils/broken", { params });
    return res.data.data;
  },

  async create(payload: Partial<Util>): Promise<Util> {
    const res = await api.post<SingleUtilResponse>("/utils", payload);
    return res.data.data;
  },

  async update(id: string, payload: Partial<Util>): Promise<Util> {
    const res = await api.put<SingleUtilResponse>(`/utils/${id}`, payload);
    return res.data.data;
  },

  async updateCondition(id: string, condition: UtilityCondition): Promise<Util> {
    const res = await api.patch<SingleUtilResponse>(`/utils/${id}/condition`, { condition });
    return res.data.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/utils/${id}`);
    return res.data;
  },
};

// Utility type labels in Vietnamese
export const UTILITY_TYPE_LABELS: Record<UtilityType, string> = {
  refrigerator: "Tủ lạnh",
  air_conditioner: "Máy lạnh",
  washing_machine: "Máy giặt",
  television: "TV",
  microwave: "Lò vi sóng",
  water_heater: "Bình nóng lạnh",
  fan: "Quạt",
  bed: "Giường",
  wardrobe: "Tủ quần áo",
  desk: "Bàn",
  chair: "Ghế",
  sofa: "Sofa",
  wifi_router: "Bộ phát WiFi",
  other: "Khác",
};

export const UTILITY_CONDITION_LABELS: Record<UtilityCondition, string> = {
  new: "Mới",
  used: "Đã dùng",
  broken: "Hỏng",
};

export const UTILITY_CONDITION_COLORS: Record<UtilityCondition, string> = {
  new: "green",
  used: "blue",
  broken: "red",
};
