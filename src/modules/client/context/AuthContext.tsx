import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/auth.service";

interface User {
  id: string;
  username?: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    role?: "ADMIN" | "LANDLORD" | "TENANT" | "STAFF";
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra xem có user đã đăng nhập không khi component mount
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      authService.saveAuthData(response.token, response.user);
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  const register = async (data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    role?: "ADMIN" | "LANDLORD" | "TENANT" | "STAFF";
  }) => {
    try {
      await authService.register(data);
      // Sau khi đăng ký thành công, có thể tự động đăng nhập
      // hoặc chuyển hướng đến trang đăng nhập
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Đăng ký thất bại");
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
