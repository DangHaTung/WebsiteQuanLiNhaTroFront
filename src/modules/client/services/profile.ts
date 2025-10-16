import api from "../services/api";
import type { IRoom, IContract, IBill } from "../../../types/profile";
import type { IUserProfile } from "../../../types/user";

export const getUserById = async (
  id: string | number
): Promise<IUserProfile> => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const getRoomsByUserId = async (
  userId: string | number
): Promise<IRoom[]> => {
  const res = await api.get(`/rooms`, {
    params: { userId },
  });
  return res.data;
};

export const getRoomById = async (id: string | number): Promise<IRoom> => {
  const res = await api.get(`/rooms/${id}`);
  return res.data;
};

export const getContractsByUserId = async (
  userId: string | number
): Promise<IContract[]> => {
  const res = await api.get(`/contracts`, {
    params: { userId },
  });
  return res.data;
};

export const getContractById = async (
  id: string | number
): Promise<IContract> => {
  const res = await api.get(`/contracts/${id}`);
  return res.data;
};

export const getBillsByUserId = async (
  userId: string | number
): Promise<IBill[]> => {
  const res = await api.get(`/bills`, {
    params: { userId },
  });
  return res.data;
};

export const getBillById = async (id: string | number): Promise<IBill> => {
  const res = await api.get(`/bills/${id}`);
  return res.data;
};

export const getProfileData = async (userId: string | number) => {
  const [user, rooms, contracts, bills] = await Promise.all([
    getUserById(userId),
    getRoomsByUserId(userId),
    getContractsByUserId(userId),
    getBillsByUserId(userId),
  ]);

  return { user, rooms, contracts, bills };
};
