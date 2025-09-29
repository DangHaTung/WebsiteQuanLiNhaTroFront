import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/client/MainLayout";
import Rooms from "./modules/client/pages/Rooms";

import "antd/dist/reset.css";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/rooms" element={<Rooms />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default App;
