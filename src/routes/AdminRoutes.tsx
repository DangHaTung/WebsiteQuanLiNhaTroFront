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

import Complaints from "../modules/admin/pages/Complaints";
import FinalContracts from "../modules/admin/pages/FinalContracts";
import DraftBills from "../modules/admin/pages/DraftBills";
import UtilityFees from "../modules/admin/pages/UtilityFees";
import CheckinsAD from "../modules/admin/pages/CheckinsAD";
import MoveOutRequestsAD from "../modules/admin/pages/MoveOutRequestsAD";
import ContractsAD from "../modules/admin/pages/ContractsAD";

const RequireAdmin = ({ children }: { children: React.ReactElement }) => {
  // Kiểm tra cả admin_token và token (vì có thể đăng nhập từ form chung)
  const adminUser = adminAuthService.getCurrentUser();
  const clientUser = (() => {
    const raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
  })();
  
  const user = adminUser || clientUser;
  const hasToken = !!localStorage.getItem("admin_token") || !!localStorage.getItem("token");

  if (!user || !hasToken) {
    // Redirect về form login chung với query param để biết là từ admin
    return <Navigate to="/login?from=admin" replace />;
  }

  // Nếu user không phải ADMIN hoặc STAFF, không cho vào
  if (user.role !== "ADMIN" && user.role !== "STAFF") {
    return <Navigate to="/" replace />;
  }

  return children;
};

const RequireAdminOnly = ({ children }: { children: React.ReactElement }) => {
  // Kiểm tra cả admin_token và token (vì có thể đăng nhập từ form chung)
  const adminUser = adminAuthService.getCurrentUser();
  const clientUser = (() => {
    const raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
  })();
  
  const user = adminUser || clientUser;
  const hasToken = !!localStorage.getItem("admin_token") || !!localStorage.getItem("token");

  if (!user || !hasToken) {
    return <Navigate to="/login?from=admin" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

const adminRoutes = [
  // Redirect admin login về form login chung
  { path: "login", element: <Navigate to="/login?from=admin" replace /> },
  { path: "register", element: <AdminRegister /> },

  { path: "dashboard", element: <RequireAdmin><Dashboard /></RequireAdmin> },
  { path: "profile", element: <RequireAdmin><Profile /></RequireAdmin> },
  { path: "bills", element: <RequireAdmin><BillsAD /></RequireAdmin> },
  { path: "draft-bills", element: <RequireAdmin><DraftBills /></RequireAdmin> },
  { path: "utility-fees", element: <RequireAdmin><UtilityFees /></RequireAdmin> },
  { path: "final-contracts", element: <RequireAdmin><FinalContracts /></RequireAdmin> },

  { path: "checkins", element: <RequireAdmin><CheckinsAD /></RequireAdmin> },
  { path: "move-out-requests", element: <RequireAdmin><MoveOutRequestsAD /></RequireAdmin> },
  { path: "contracts", element: <RequireAdmin><ContractsAD /></RequireAdmin> },
  { path: "roomsad", element: <RequireAdmin><RoomsAD /></RequireAdmin> },
  { path: "complaints", element: <RequireAdmin><Complaints /></RequireAdmin> },

  // ADMIN
  { path: "users", element: <RequireAdminOnly><Users /></RequireAdminOnly> },
];

export default adminRoutes;
