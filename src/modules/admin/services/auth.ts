import api from "../services/api";
import { message } from "antd";

type LoginPayload = { email: string; password: string };
type RegisterPayload = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
};

type User = {
  id: string;
  username?: string;
  fullName?: string;
  email: string;
  role: string;
};

type LoginResponse = { message: string; token: string; user: User };
type RegisterResponse = {
  message: string;
  user: Pick<User, "id" | "email" | "role"> & { fullName?: string };
};

export const adminAuthService = {
  async login(payload: LoginPayload) {
    const { data } = await api.post<LoginResponse>("/login", payload);
    if (data.user.role !== "ADMIN" && data.user.role !== "STAFF") {
      throw new Error("Tài khoản không có quyền ADMIN");
    }
    return data;
  },

  async register(payload: RegisterPayload) {
    const { data } = await api.post<RegisterResponse>("/register", {
      ...payload,
      role: "ADMIN",
    });
    return data;
  },

  saveAuthData(token: string, user: User) {
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_currentUser", JSON.stringify(user));
  },

  clearAuthData() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_currentUser");
  },

  getCurrentUser(): User | null {
    // Kiểm tra cả admin_currentUser và currentUser (vì có thể đăng nhập từ form chung)
    const adminRaw = localStorage.getItem("admin_currentUser");
    const clientRaw = localStorage.getItem("currentUser");
    const raw = adminRaw || clientRaw;
    return raw ? (JSON.parse(raw) as User) : null;
  },

  isAuthenticated(): boolean {
    // Kiểm tra cả admin_token và token (vì có thể đăng nhập từ form chung)
    return !!(localStorage.getItem("admin_token") || localStorage.getItem("token"));
  },

  logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    message.success("Đăng xuất thành công!");
    window.location.href = "/login";
  },
};
