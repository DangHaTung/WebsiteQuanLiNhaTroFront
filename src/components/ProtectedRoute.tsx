import React from "react";
import { Navigate } from "react-router-dom";
import { clientAuthService } from "../modules/client/services/auth";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireRole?: "ADMIN" | "USER" | "STAFF";
  allowAdmin?: boolean; // Cho phép ADMIN vào route này không
}

/**
 * ProtectedRoute - Bảo vệ route cho client
 * Nếu chưa đăng nhập, redirect về /login
 * Nếu là ADMIN, redirect về /admin/dashboard (trừ khi allowAdmin=true)
 * Nếu có requireRole, kiểm tra role của user
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireRole,
  allowAdmin = false // Mặc định không cho ADMIN vào client routes
}) => {
  const user = clientAuthService.getCurrentUser();
  const token = localStorage.getItem("token");

  // Chưa đăng nhập
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // ADMIN không được vào client routes (trừ khi allowAdmin=true)
  if (user.role === "ADMIN" && !allowAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Kiểm tra role nếu có yêu cầu
  if (requireRole && user.role !== requireRole) {
    // Nếu không đúng role, redirect về home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

