import api from "../services/api";
import type { IUser, IRoom, IContract, IBill } from "../../../types/profile";

export const getUser = async (): Promise<IUser> => {
  const res = await api.get("/users");
  return res.data[0]; // lấy user đầu tiên
};

export const getUserById = async (id: string | number): Promise<IUser> => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const getRooms = async (): Promise<IRoom[]> => {
  const res = await api.get("/rooms");
  return res.data;
};

export const getContracts = async (): Promise<IContract[]> => {
  const res = await api.get("/contracts");
  return res.data;
};

export const getBills = async (): Promise<IBill[]> => {
  const res = await api.get("/bills");
  return res.data;
};

export const getProfileData = async () => {
  const [user, rooms, contracts, bills] = await Promise.all([
    getUser(),
    getRooms(),
    getContracts(),
    getBills(),
  ]);

  return { user, rooms, contracts, bills };
};
