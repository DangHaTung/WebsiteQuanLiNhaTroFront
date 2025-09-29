import React from "react";
import { Link } from "react-router-dom";
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
    <div className="navbar-wrapper">
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

          {/* Menu danh mục */}
          <div
            className="nav-menu"
            style={{
              marginTop: "12px",
              padding: "12px 0",
              background: "#f9f9f9",
              borderTop: "1px solid #eee",
              display: "flex",
              gap: "32px",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            <Link to="/">Trang chủ</Link>
            <Link to="/rooms">Danh sách phòng</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
