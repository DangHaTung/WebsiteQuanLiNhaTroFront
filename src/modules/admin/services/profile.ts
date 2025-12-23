import api from "../services/api";
import { jwtDecode } from "jwt-decode";
import type { IUserToken, User } from "../../../types/user";

/**
 * Lấy userId từ JWT token trong localStorage.
 * - Trả về userId nếu token hợp lệ.
 * - Trả về null nếu token hết hạn hoặc không hợp lệ.
 * 
 * @returns {string | null} userId hoặc null
 */
const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem("admin_token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<IUserToken>(token);
    if (!decoded.id) return null;
    return decoded.id;
  } catch (err) {
    console.error("Token không hợp lệ hoặc đã hết hạn:", err);

    // Xóa token nếu lỗi để tránh lặp lỗi
    localStorage.removeItem("admin_token");
    return null;
  }
};

/**
 * Lấy thông tin profile để hiển thị lên form
 * - Kiểm tra token hợp lệ
 * - Chỉ cho phép ADMIN hoặc STAFF
 * 
 * @returns {Promise<User | null>} User hợp lệ hoặc null
 */
export const getProfileForForm = async (): Promise<User | null> => {
  const userId = getUserIdFromToken();
  if (!userId) return null;

  try {
    const res = await api.get(`/users/${userId}`);
    const userData = res.data.data;

    // Kiểm tra quyền
    if (userData.role !== "ADMIN" && userData.role !== "STAFF") {
      console.warn("Người dùng không có quyền truy cập:", userData.role);
      return null;
    }

    // Trả về dữ liệu theo đúng interface User
    return {
      _id: userData._id,
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      createdAt: userData.createdAt,
    } as User;

  } catch (err) {
    console.error("Lỗi khi lấy profile cho form:", err);
    return null;
  }
};

/**
 * Cập nhật thông tin cá nhân (fullName, phone ...)
 * - Không dùng FormData, chỉ gửi JSON
 *
 * @param payload { fullName, phone }
 * @returns {Promise<User>} User đã cập nhật
 */
export const updateProfile = async (payload: {
  fullName: string;
  phone?: string;
}): Promise<User> => {
  const userId = getUserIdFromToken();
  if (!userId) throw new Error("Không tìm thấy token hoặc token đã hết hạn");

  try {
    const { data } = await api.put(`/users/${userId}`, payload);

    return {
      _id: data._id,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      createdAt: data.createdAt,
      avatar: data.avatar, // giữ avatar cũ
    } as User;

  } catch (err) {
    console.error("Cập nhật profile thất bại:", err);
    throw err;
  }
};

/**
 * Cập nhật mật khẩu
 * - Yêu cầu currentPassword và newPassword
 *
 * @param payload { currentPassword, newPassword }
 * @returns {Promise<void>}
 */
export const updatePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  const userId = getUserIdFromToken();
  if (!userId) throw new Error("Không tìm thấy token hoặc token đã hết hạn");

  try {
    const res = await api.put("/users/reset-password", payload);
    console.log("Đổi mật khẩu thành công:", res.data);

  } catch (err: any) {
    console.error("Cập nhật mật khẩu thất bại:", err.message);
    console.log("Mã lỗi:", err.response?.status);
    console.log("Dữ liệu trả về:", err.response?.data);
    throw err;
  }
};
