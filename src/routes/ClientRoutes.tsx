import Home from "../modules/client/pages/Home";
import Rooms from "../modules/client/pages/Rooms";
import RoomsDetail from "../modules/client/pages/RoomsDetail";


const clientRoutes = [
  { path: "/", element: <Home /> },
  { path: "rooms", element: <Rooms /> },
  { path: "rooms/:id", element: <RoomsDetail /> },
];

export default clientRoutes;
