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
};
