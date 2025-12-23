import api from "./api";

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: "ADMIN" | "LANDLORD" | "TENANT" | "STAFF";
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type UserInfo = {
  id: string;
  username?: string;
  fullName?: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: UserInfo;
};

export type RegisterResponse = {
  message: string;
  user: Pick<UserInfo, "id" | "email" | "role"> & { fullName?: string };
};

export const clientAuthService = {
  async register(payload: RegisterPayload) {
    const { data } = await api.post<RegisterResponse>("/register", payload);
    return data;
  },

  async login(payload: LoginPayload) {
    const { data } = await api.post<LoginResponse>("/login", payload);
    return data;
  },

  saveAuthData(token: string, user: UserInfo) {
    localStorage.setItem("token", token);
    localStorage.setItem("currentUser", JSON.stringify(user));
  },

  clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
  },

  getCurrentUser(): UserInfo | null {
    const raw = localStorage.getItem("currentUser");
    return raw ? (JSON.parse(raw) as UserInfo) : null;
  },
};


