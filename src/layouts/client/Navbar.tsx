import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Input, Badge } from "antd";
import Logo from "../../assets/images/logo.png";
import "../../assets/styles/nav.css";
import {
  PhoneOutlined,
  MailOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Search } = Input;

const Navbar: React.FC = () => {
  return (
    // Sticky navbar: luôn hiển thị khi cuộn trang
    <div
      className="navbar-wrapper"
      style={{ position: "sticky", top: 0, zIndex: 1000, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      {/* Top bar */}
      <div
        style={{
          background: "#0D2A5C",
          color: "#fff",
          fontSize: "14px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "4px 20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {/* Liên hệ */}
          <div style={{ display: "flex", gap: "16px" }}>
            <span>
              <PhoneOutlined /> 0123 456 789
            </span>
            <span>
              <MailOutlined /> support@tro360.com
            </span>
          </div>

          {/* Menu nhỏ */}
          <div style={{ display: "flex", gap: "16px" }}>
            <Link to="/orders" style={{ color: "#fff" }}>
              Theo dõi đơn hàng
            </Link>
            <Link to="/store" style={{ color: "#fff" }}>
              Cửa hàng
            </Link>
            <Link to="/contact" style={{ color: "#fff" }}>
              Liên hệ
            </Link>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #eee",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "12px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            {/* Logo */}
            <div style={{ fontSize: "22px", fontWeight: "bold" }}>
              <Link to="/">
                <img src={Logo} alt="Tro360 Logo" style={{ height: "80px", width: "auto", objectFit: "contain" }} />
              </Link>
            </div>

            {/* Ô tìm kiếm */}
            <div style={{ flex: 1, maxWidth: "500px" }}>
              <Search
                placeholder="Tìm kiếm sản phẩm thời trang nam..."
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={(value) => console.log("Search:", value)}
              />
            </div>

            {/* Giỏ hàng + Đăng nhập */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Badge count={0} size="small">
                <ShoppingCartOutlined style={{ fontSize: "22px" }} />
              </Badge>
              <div>
                <Link to="/login">Đăng nhập</Link> /{" "}
                <Link to="/register">Đăng ký</Link>
              </div>
            </div>
          </div>

          {/* Menu danh mục (pill style với trạng thái active/hover) */}
          <nav
            style={{
              marginTop: "12px",
              padding: "12px 0",
              background: "#ffffff",
              borderTop: "1px solid #eee",
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              fontSize: "15px",
              fontWeight: 600,
              flexWrap: "wrap",
            }}
          >
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active" : "")}
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#0D2A5C",
                background: isActive ? "#1677ff" : "transparent",
                padding: "8px 14px",
                borderRadius: 999,
                transition: "all .2s ease",
              })}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                if (!el.classList.contains("active")) el.style.background = "#f0f5ff";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                if (!el.classList.contains("active")) el.style.background = "transparent";
              }}
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/rooms"
              className={({ isActive }) => (isActive ? "active" : "")}
              style={({ isActive }) => ({
                color: isActive ? "#fff" : "#0D2A5C",
                background: isActive ? "#1677ff" : "transparent",
                padding: "8px 14px",
                borderRadius: 999,
                transition: "all .2s ease",
              })}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                if (!el.classList.contains("active")) el.style.background = "#f0f5ff";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                if (!el.classList.contains("active")) el.style.background = "transparent";
              }}
            >
              Danh sách phòng
            </NavLink>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
