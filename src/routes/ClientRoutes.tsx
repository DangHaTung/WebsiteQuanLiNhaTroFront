import Checkin from "../modules/client/pages/Checkin";
import Home from "../modules/client/pages/Home";
import Login from "../modules/client/pages/Login";
import Register from "../modules/client/pages/Register";
import Rooms from "../modules/client/pages/Rooms";
import RoomsDetail from "../modules/client/pages/RoomsDetail";
import Support from "../modules/client/pages/Support";
import Profile from "../modules/client/pages/Profile";
import Settings from "../modules/client/pages/Settings";
import Contracts from "../modules/client/pages/Contracts";
import PaymentSuccess from "../modules/client/pages/PaymentSuccess";
import Complaint from "../modules/client/pages/Complaint";
import Invoices from "../modules/client/pages/Invoices";
import InvoiceDetail from "../modules/client/pages/InvoiceDetail";
import MyContractsDetail from "../modules/client/pages/MyContractsDetail";
import MyMoveOutRequests from "../modules/client/pages/MyMoveOutRequests";
import ProtectedRoute from "../components/ProtectedRoute";

const clientRoutes = [
  // Public routes
  { path: "/", element: <Home /> },
  { path: "rooms", element: <Rooms /> },
  { path: "rooms/:id", element: <RoomsDetail /> },
  { path: "login", element: <Login /> },
  { path: "register", element: <Register /> },
  { path: "support", element: <Support /> },
  
  // Protected routes - cần đăng nhập
  { path: "checkin", element: <ProtectedRoute><Checkin /></ProtectedRoute> },
  { path: "checkin/:roomId", element: <ProtectedRoute><Checkin /></ProtectedRoute> },
  { path: "contracts", element: <ProtectedRoute><Contracts /></ProtectedRoute> },
  { path: "contracts/:roomId", element: <ProtectedRoute><Contracts /></ProtectedRoute> },
  { path: "profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
  { path: "settings", element: <ProtectedRoute><Settings /></ProtectedRoute> },
  { path: "complaint", element: <ProtectedRoute><Complaint /></ProtectedRoute> },
  { path: "payment-success", element: <ProtectedRoute><PaymentSuccess /></ProtectedRoute> },
  { path: "thanh-toan-thanh-cong", element: <ProtectedRoute><PaymentSuccess /></ProtectedRoute> },
  { path: "invoices", element: <ProtectedRoute><Invoices /></ProtectedRoute> },
  { path: "invoices/:id", element: <ProtectedRoute><InvoiceDetail /></ProtectedRoute> },
  { path: "my-contracts", element: <ProtectedRoute><MyContractsDetail /></ProtectedRoute> },
  { path: "my-move-out-requests", element: <ProtectedRoute><MyMoveOutRequests /></ProtectedRoute> },
];

export default clientRoutes;
