import api from "./api";
import type { Room } from "../../../types/room";

export const getAllRooms = async (): Promise<Room[]> => {
  const res = await api.get("/rooms");
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

export const getRoomById = async (id: string): Promise<Room> => {
  const res = await api.get(`/rooms/${id}`);
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};
