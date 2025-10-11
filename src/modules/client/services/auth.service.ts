import api from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role?: "ADMIN" | "LANDLORD" | "TENANT" | "STAFF";
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username?: string;
    email: string;
    role: string;
  };
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export const authService = {
  // Đăng nhập
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post("/login", data);
    return response.data;
  },

  // Đăng ký
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post("/register", data);
    return response.data;
  },

  // Đăng xuất (xóa token khỏi localStorage)
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Lưu thông tin user và token
  saveAuthData: (token: string, user: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  // Lấy thông tin user từ localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    return !!token;
  },
};