import Dashboard from "../modules/admin/pages/Dashboard";
import Profile from "../modules/admin/pages/Profile";

const adminRoutes = [
  { path: "dashboard", element: <Dashboard /> },
  { path: "profile", element: <Profile /> },
];

export default adminRoutes;
