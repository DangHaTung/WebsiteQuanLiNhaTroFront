import api from "../services/api";
import { jwtDecode } from "jwt-decode";
import type { IUserToken, User } from "../../../types/user";

/**
 * Lấy userId từ token, kiểm tra hợp lệ
 * userId nếu hợp lệ, null nếu token hết hạn / invalid
 */
const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem("admin_token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<IUserToken>(token);
    if (!decoded.id) return null;
    return decoded.id;
  } catch (err) {
    console.error("Token không hợp lệ hoặc hết hạn:", err);
    localStorage.removeItem("admin_token"); // xóa token hỏng
    return null;
  }
};

/**
 * Lấy profile cho form
 * User nếu token hợp lệ, null nếu không
 */
export const getProfileForForm = async (): Promise<User | null> => {
  const userId = getUserIdFromToken();
  if (!userId) return null;

  try {
    const res = await api.get(`/users/${userId}`);
    const userData = res.data.data; 

    if (userData.role !== "ADMIN" && userData.role !== "STAFF") {
      console.warn("Người dùng không có quyền hợp lệ:", userData.role);
      return null;
    }

    return {
      _id: userData._id,
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      createdAt: userData.createdAt,
    } as User;
  } catch (err) {
    console.error("Lấy profile cho form thất bại:", err);
    return null;
  }
};

/**
 * Cập nhật profile
 */
export const updateProfile = async (payload: {
  fullName: string;
  phone?: string;
}): Promise<User> => {
  const userId = getUserIdFromToken();
  if (!userId) throw new Error("Không tìm thấy token hoặc token hết hạn");

  try {
    // Gửi payload JSON, không FormData
    const { data } = await api.put(`/users/${userId}`, payload);

    return {
      _id: data._id,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      createdAt: data.createdAt,
      avatar: data.avatar, // giữ nguyên avatar nếu có
    } as User;
  } catch (err) {
    console.error("Cập nhật profile thất bại:", err);
    throw err;
  }
};

export const updatePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  const userId = getUserIdFromToken();
  if (!userId) throw new Error("Không tìm thấy token hoặc token hết hạn");

  try {
    const res = await api.put("/users/reset-password", payload);
    console.log("Response data:", res.data);
  } catch (err: any) {
    console.error("Cập nhật mật khẩu thất bại:", err.message);
    console.log("Response status:", err.response?.status);
    console.log("Response data:", err.response?.data);
    throw err;
  }
};
