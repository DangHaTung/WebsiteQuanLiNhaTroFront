import Dashboard from "../modules/admin/pages/Dashboard";
import Profile from "../modules/admin/pages/Profile";
import RoomsAD from "../modules/admin/pages/RoomsAD";
import Users from "../modules/admin/pages/Users";
import ContractsAD from "../modules/admin/pages/ContractsAD";
import BillsAD from "../modules/admin/pages/BillsAD";

const adminRoutes = [
  { path: "dashboard", element: <Dashboard /> },
  { path: "profile", element: <Profile /> },
  { path: "roomsad", element: <RoomsAD /> },
  { path: "users", element: <Users /> },
  { path: "contracts", element: <ContractsAD /> },
  { path: "bills", element: <BillsAD /> },
];

export default adminRoutes;
