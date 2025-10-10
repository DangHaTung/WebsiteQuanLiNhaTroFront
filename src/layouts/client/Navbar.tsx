import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input, Badge, Drawer, Button } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  HeartOutlined,
  SearchOutlined,
  HomeOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import Logo from "../../assets/images/logo.png";
import "../../assets/styles/nav.css";

const { Search } = Input;

const Navbar: React.FC = () => {
  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <div className="navbar-wrapper">
      {/* Top bar */}
      <div className="nav-top">
        <div className="nav-container nav-top-inner">
          <div className="nav-top-contact">
            <span>
              <PhoneOutlined /> <strong>0123 456 789</strong>
            </span>
            <span>
              <MailOutlined /> support@tro360.com
            </span>
          </div>

          <div className="nav-top-menu">
            <Link to="/post-room" className="nav-top-link highlight">
              <HomeOutlined /> Đăng tin cho thuê
            </Link>
            <Link to="/contact" className="nav-top-link highlight">
              <CustomerServiceOutlined className="icon" /> Hỗ trợ
            </Link>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="nav-main">
        <div className="nav-container nav-main-inner">
          {/* Logo */}
          <div className="nav-logo">
            <Link to="/">
              <img src={Logo} alt="Tro360 Logo" className="logo-hover" />
            </Link>
          </div>

          {/* Ô tìm kiếm */}
          <div className="nav-search">
            <Search
              placeholder="Tìm phòng trọ, căn hộ, nhà nguyên căn..."
              enterButton={<SearchOutlined />}
              size="large"
              allowClear
              onSearch={(value) => console.log("Search:", value)}
            />
          </div>

          {/* Wishlist + User */}
          <div className="nav-actions">
            <Badge count={3} size="small">
              <HeartOutlined className="nav-icon wishlist-icon" />
            </Badge>
            <div className="nav-user">
              <UserOutlined />
              <Link to="/login">Đăng nhập</Link>
              <span>/</span>
              <Link to="/register">Đăng ký</Link>
            </div>
            <Button
              className="menu-btn"
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setOpenDrawer(true)}
            />
          </div>
        </div>

        {/* Menu danh mục */}
        <div className="nav-menu">
          <Link className="nav-link" to="/">
            Trang chủ
          </Link>
          <Link className="nav-link" to="/rooms">
            Danh sách phòng
          </Link>
          <Link className="nav-link" to="/news">
            Tin tức & Mẹo thuê trọ
          </Link>
          <Link className="nav-link" to="/about">
            Giới thiệu
          </Link>
          <Link className="nav-link" to="/contact">
            Liên hệ
          </Link>
        </div>
      </div>

      {/* Drawer Mobile */}
      <Drawer
        placement="right"
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
        closeIcon={<CloseOutlined />}
        width={250}
      >
        <div className="drawer-menu">
          <Link to="/" onClick={() => setOpenDrawer(false)}>
            Trang chủ
          </Link>
          <Link to="/rooms" onClick={() => setOpenDrawer(false)}>
            Danh sách phòng
          </Link>
          <Link to="/news" onClick={() => setOpenDrawer(false)}>
            Tin tức & Mẹo thuê trọ
          </Link>
          <Link to="/about" onClick={() => setOpenDrawer(false)}>
            Giới thiệu
          </Link>
          <Link to="/contact" onClick={() => setOpenDrawer(false)}>
            Liên hệ
          </Link>
        </div>
      </Drawer>
    </div>
  );
};

export default Navbar;
