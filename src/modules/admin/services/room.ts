import api from "../services/api";
import type { Room } from "../../../types/room";

export const adminRoomService = {
  async getAll(params?: { page?: number; limit?: number; status?: string; type?: string; q?: string }): Promise<Room[]> {
    const res = await api.get("/rooms", { params });
    return res.data.data;
  },

  async getById(id: string): Promise<Room> {
    const res = await api.get(`/rooms/${id}`);
    return res.data.data;
  },

  async create(payload: FormData): Promise<Room> {
    const res = await api.post("/rooms", payload);
    return res.data.data;
  },

  async update(id: string, payload: FormData): Promise<Room> {
    const res = await api.put(`/rooms/${id}`, payload);
    return res.data.data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/rooms/${id}`);
    return res.data;
  },
};
