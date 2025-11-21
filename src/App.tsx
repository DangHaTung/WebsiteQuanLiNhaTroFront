import { Routes, Route, Navigate } from "react-router-dom";

// ✅ Layouts
import ClientLayout from "./layouts/client/ClientLayout";
import AdminLayout from "./layouts/admin/AdminLayout";

// ✅ Routes
import clientRoutes from "./routes/ClientRoutes";
import adminRoutes from "./routes/AdminRoutes";

// ✅ Pages (các trang bổ sung)
// notifications removed
import Contracts from "./modules/client/pages/Contracts";
import Invoices from "./modules/client/pages/Invoices";
import Login from "./modules/client/pages/Login";
import Register from "./modules/client/pages/Register";
import PublicPayment from "./modules/client/pages/PublicPayment"; 

const App = () => {
  return (
    <Routes>
      {/* Public Payment Route - không cần layout */}
      <Route path="/public/payment/:billId/:token" element={<PublicPayment />} />
      <Route path="/public/payment/:billId/:token/success" element={<PublicPayment />} />

      {/* Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<ClientLayout />}>
        {clientRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/** notifications route removed */}
        <Route path="contracts" element={<Contracts />} />
        <Route path="invoices" element={<Invoices />} />
      </Route>

      <Route path="/admin/*" element={<AdminLayout />}>
        {adminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* 404 Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
