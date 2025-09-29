import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ClientLayout from "./layouts/client/ClientLayout";
import AdminLayout from "./layouts/admin/AdminLayout";

import clientRoutes from "./routes/clientRoutes";
import adminRoutes from "./routes/adminRoutes";

const App = () => {
  return (
    <Routes>
      {/* Client routes */}
      <Route path="/" element={<ClientLayout />}>
        {clientRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* Admin routes */}
      <Route path="/admin/*" element={<AdminLayout />}>
        {adminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* 404 redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
