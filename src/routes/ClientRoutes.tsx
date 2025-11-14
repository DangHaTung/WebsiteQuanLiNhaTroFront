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

const clientRoutes = [
  { path: "/", element: <Home /> },
  { path: "rooms", element: <Rooms /> },
  { path: "rooms/:id", element: <RoomsDetail /> },
  { path: "checkin", element: <Checkin /> },
  { path: "login", element: <Login /> },
  { path: "register", element: <Register /> },
  { path: "contracts", element: <Contracts /> },
  { path: "contracts/:roomId", element: <Contracts /> },
  { path: "support", element: <Support /> },
  { path: "profile", element: <Profile /> },
  { path: "settings", element: <Settings /> },
  { path: "checkin", element: <Checkin /> },
  { path: "checkin/:roomId", element: <Checkin /> },
  { path: "complaint", element: <Complaint /> },
  { path: "payment-success", element: <PaymentSuccess /> },
  { path: "thanh-toan-thanh-cong", element: <PaymentSuccess /> },
  { path: "invoices", element: <Invoices /> },
  { path: "invoices/:id", element: <InvoiceDetail /> },
  { path: "my-contracts", element: <MyContractsDetail /> },
];

export default clientRoutes;
