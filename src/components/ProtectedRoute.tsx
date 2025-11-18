import React from "react";
import { Navigate } from "react-router-dom";
import { clientAuthService } from "../modules/client/services/auth";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireRole?: "ADMIN" | "USER" | "STAFF";
}

/**
 * ProtectedRoute - Bảo vệ route cho client
 * Nếu chưa đăng nhập, redirect về /login
 * Nếu có requireRole, kiểm tra role của user
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireRole 
}) => {
  const user = clientAuthService.getCurrentUser();
  const token = localStorage.getItem("token");

  // Chưa đăng nhập
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role nếu có yêu cầu
  if (requireRole && user.role !== requireRole) {
    // Nếu là ADMIN nhưng đang ở client route, redirect về admin
    if (user.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Nếu không đúng role, redirect về home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

