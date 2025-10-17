import api from "../services/api";
import { jwtDecode } from "jwt-decode";
import type { IRoom, IContract, IBill } from "../../../types/profile";
import type { IUserToken } from "../../../types/user";

// Giữ nguyên các hàm lấy theo ID
export const getRoomById = async (id: string | number): Promise<IRoom> => {
  const res = await api.get(`/rooms/${id}`);
  return res.data;
};

export const getContractById = async (
  id: string | number
): Promise<IContract> => {
  const res = await api.get(`/contracts/${id}`);
  return res.data;
};

export const getBillById = async (id: string | number): Promise<IBill> => {
  const res = await api.get(`/bills/${id}`);
  return res.data;
};

// Lấy rooms, contracts, bills theo userId (_id trong DB)
export const getRoomsByUserId = async (userId: string): Promise<IRoom[]> => {
  const res = await api.get(`/rooms`, { params: { userId } });
  return res.data;
};

export const getContractsByUserId = async (
  userId: string
): Promise<IContract[]> => {
  const res = await api.get(`/contracts`, { params: { userId } });
  return res.data;
};

export const getBillsByUserId = async (userId: string): Promise<IBill[]> => {
  const res = await api.get(`/bills`, { params: { userId } });
  return res.data;
};

// Lấy profile kết hợp: decode token + gọi API các dữ liệu cần thiết
export const getProfileDataFromToken = async (): Promise<{
  user: IUserToken;
  rooms: IRoom[];
  contracts: IContract[];
  bills: IBill[];
} | null> => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const user = jwtDecode<IUserToken>(token);
    const userId = user.id; // Lấy đúng trường từ token
    if (!userId) {
      console.error("User ID không tồn tại trong token");
      return null;
    }

    const [rooms, contracts, bills] = await Promise.all([
      getRoomsByUserId(userId),
      getContractsByUserId(userId),
      getBillsByUserId(userId),
    ]);

    return { user, rooms, contracts, bills };
  } catch (err) {
    console.error("Lấy profile thất bại:", err);
    return null;
  }
};
