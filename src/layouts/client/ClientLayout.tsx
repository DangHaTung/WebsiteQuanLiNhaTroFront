import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import "../../assets/styles/sticky.css";
const { Content } = Layout;

const ClientLayout: React.FC = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // cuộn xuống -> ẩn navbar
        setShowNavbar(false);
      } else {
        // cuộn lên -> hiện navbar
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div
        className={`navbar-container ${showNavbar ? "show" : "hide"}`}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
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
