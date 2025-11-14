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
  { path: "draft-bills", element: <RequireAdmin><DraftBills /></RequireAdmin> },
  { path: "utility-fees", element: <RequireAdmin><UtilityFees /></RequireAdmin> },
  { path: "final-contracts", element: <RequireAdmin><FinalContracts /></RequireAdmin> },

  { path: "checkins", element: <RequireAdmin><CheckinsAD /></RequireAdmin> },
  { path: "roomsad", element: <RequireAdmin><RoomsAD /></RequireAdmin> },
  { path: "complaints", element: <RequireAdmin><Complaints /></RequireAdmin> },

  // ADMIN
  { path: "users", element: <RequireAdminOnly><Users /></RequireAdminOnly> },
];

export default adminRoutes;
