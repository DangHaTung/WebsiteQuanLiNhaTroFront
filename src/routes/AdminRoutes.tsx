import React from "react";
import Dashboard from "../modules/admin/pages/Dashboard";
import Profile from "../modules/admin/pages/Profile";
import RoomsAD from "../modules/admin/pages/RoomsAD";
import AdminLogin from "../modules/admin/pages/AdminLogin";
import AdminRegister from "../modules/admin/pages/AdminRegister";
import { Navigate } from "react-router-dom";
import { adminAuthService } from "../modules/admin/services/auth";
import BillsAD from "../modules/admin/pages/BillsAD";
import Users from "../modules/admin/pages/Users";
import ContractsAD from "../modules/admin/pages/ContractsAD";
import Complaints from "../modules/admin/pages/Complaints";
// notifications removed

const RequireAdmin = ({ children }: { children: React.ReactElement }) => {
  const user = adminAuthService.getCurrentUser();

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const RequireAdminOnly = ({ children }: { children: React.ReactElement }) => {
  const user = adminAuthService.getCurrentUser();

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

const adminRoutes = [
  { path: "login", element: <AdminLogin /> },
  { path: "register", element: <AdminRegister /> },

  { path: "dashboard", element: <RequireAdmin><Dashboard /></RequireAdmin> },
  { path: "profile", element: <RequireAdmin><Profile /></RequireAdmin> },
  { path: "bills", element: <RequireAdmin><BillsAD /></RequireAdmin> },
  { path: "contracts", element: <RequireAdmin><ContractsAD /></RequireAdmin> },
  { path: "roomsad", element: <RequireAdmin><RoomsAD /></RequireAdmin> },

  // ADMIN
  { path: "users", element: <RequireAdminOnly><Users /></RequireAdminOnly> },
];

export default adminRoutes;
