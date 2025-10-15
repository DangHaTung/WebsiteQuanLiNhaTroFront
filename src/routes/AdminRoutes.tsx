import React from "react";
import Dashboard from "../modules/admin/pages/Dashboard";
import Profile from "../modules/admin/pages/Profile";
import RoomsAD from "../modules/admin/pages/RoomsAD";
import AdminLogin from "../modules/admin/pages/AdminLogin";
import AdminRegister from "../modules/admin/pages/AdminRegister";
import { Navigate } from "react-router-dom";
import { adminAuthService } from "../modules/admin/services/auth";

const RequireAdmin = ({ children }: { children: React.ReactElement }) =>
  adminAuthService.isAuthenticated() ? children : <Navigate to="/admin/login" replace />;

const adminRoutes = [
  { path: "login", element: <AdminLogin /> },
  { path: "register", element: <AdminRegister /> },
  { path: "dashboard", element: <RequireAdmin><Dashboard /></RequireAdmin> },
  { path: "profile", element: <RequireAdmin><Profile /></RequireAdmin> },
  { path: "roomsad", element: <RequireAdmin><RoomsAD /></RequireAdmin> },
];

export default adminRoutes;
