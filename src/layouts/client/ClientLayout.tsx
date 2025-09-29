import React from "react";
import Navbar from "./Navbar";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";

const { Content, Footer } = Layout;

const ClientLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header */}
      <Navbar />

      {/* Content */}
      <Content style={{ width: "100%", padding: "24px 20px", maxWidth: "1300px", margin: "0 auto" }}>
        <Outlet />
      </Content>

      {/* Footer */}
      <Footer style={{ textAlign: "center", background: "#212529", color: "#fff" }}>
        ©{new Date().getFullYear()} Tro360. Bản quyền thuộc về Nhom WD-04 .
      </Footer>
    </Layout>
  );
};

export default ClientLayout;
