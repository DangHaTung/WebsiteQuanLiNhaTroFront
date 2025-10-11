import Contact from "../modules/client/pages/Contact";
import Home from "../modules/client/pages/Home";
import Login from "../modules/client/pages/Login";
import Register from "../modules/client/pages/Register";
import Rooms from "../modules/client/pages/Rooms";
import RoomsDetail from "../modules/client/pages/RoomsDetail";
import Support from "../modules/client/pages/Support";
import Profile from "../modules/client/pages/Profile";
import Settings from "../modules/client/pages/Settings";
import Contracts from "../modules/client/pages/Contracts";
import Invoices from "../modules/client/pages/Invoices";



const clientRoutes = [
  { path: "/", element: <Home /> },
  { path: "rooms", element: <Rooms /> },
  { path: "rooms/:id", element: <RoomsDetail /> },
  { path: "login", element: <Login /> },
  { path: "register", element: <Register /> },
  { path: "contact", element: <Contact /> },
  { path: "support", element: <Support /> },
  { path: "profile", element: <Profile /> },
  { path: "settings", element: <Settings /> },
  { path: "contract", element: <Contracts /> },
  { path: "invoice", element: <Invoices /> },

];

export default clientRoutes;
