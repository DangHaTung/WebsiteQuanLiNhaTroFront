import api from "../services/api";
import { jwtDecode } from "jwt-decode";
import type { IRoom, IContract, IBill } from "../../../types/profile";
import type { IUserToken } from "../../../types/user";

// Giữ nguyên các hàm lấy theo ID
export const getRoomById = async (id: string | number): Promise<IRoom> => {
  const res = await api.get(`/rooms/public/${id}`);
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

// Lấy rooms, contracts, bills của user hiện tại
export const getMyRooms = async (): Promise<IRoom[]> => {
  const res = await api.get(`/rooms/public`);
  return res.data.data;
};

export const getMyContracts = async (): Promise<IContract[]> => {
  const res = await api.get(`/contracts/my-contracts`);
  return res.data.data;
};

export const getMyBills = async (): Promise<IBill[]> => {
  const res = await api.get(`/bills/my-bills`);
  return res.data.data;
};

// Đổi mật khẩu (yêu cầu token qua interceptor)
export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const res = await api.put(`/reset-password`, { currentPassword, newPassword });
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
      getMyRooms(),
      getMyContracts(),
      getMyBills(),
    ]);

    return { user, rooms, contracts, bills };
  } catch (err) {
    console.error("Lấy profile thất bại:", err);
    return null;
  }
};
