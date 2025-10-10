import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// ✅ Layouts
import ClientLayout from "./layouts/client/ClientLayout";
import AdminLayout from "./layouts/admin/AdminLayout";

// ✅ Routes
import clientRoutes from "./routes/clientRoutes";
import adminRoutes from "./routes/adminRoutes";

// ✅ Pages (các trang bổ sung)
import Notifications from "./modules/client/pages/Notifications";
import Contracts from "./modules/client/pages/Contracts";
import Invoices from "./modules/client/pages/Invoices"; 

const App = () => {
  return (
    <Routes>
      {}
      <Route path="/" element={<ClientLayout />}>
        {}
        {clientRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {}
        <Route path="notifications" element={<Notifications />} />

        {}
        <Route path="contracts" element={<Contracts />} />

        {}
        <Route path="invoices" element={<Invoices />} />
      </Route>

      {}
      <Route path="/admin/*" element={<AdminLayout />}>
        {adminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* ===================== 404 Redirect ===================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
