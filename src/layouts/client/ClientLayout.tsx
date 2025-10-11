import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
const { Content } = Layout;

const ClientLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header - Navbar luôn hiển thị */}
      <div
        className="navbar-container show"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <Navbar />
      </div>

      {/* Content */}
      <Content style={{ width: "100%", maxWidth: "1300px", margin: "0 auto" }}>
        <Outlet />
      </Content>

      {/* Footer */}
      <Footer />
    </Layout>
  );
};

export default ClientLayout;
