import Home from "../modules/client/pages/Home";
import Rooms from "../modules/client/pages/Rooms";

const clientRoutes = [
  { path: "/", element: <Home /> },
  { path: "rooms", element: <Rooms /> },
  { path: "login", element: <Login /> },
  { path: "register", element: <Register /> },
];

export default clientRoutes;
