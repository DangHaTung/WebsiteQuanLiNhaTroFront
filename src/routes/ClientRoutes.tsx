import Home from "../modules/client/pages/Home";
import Rooms from "../modules/client/pages/Rooms";

const clientRoutes = [
  { path: "/", element: <Home /> },
  { path: "rooms", element: <Rooms /> },
];

export default clientRoutes;
