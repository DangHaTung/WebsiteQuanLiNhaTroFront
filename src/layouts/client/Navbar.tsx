import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, Badge, Drawer, Button, Dropdown, Avatar, Typography } from "antd";
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
  SettingOutlined,
  LogoutOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import Logo from "../../assets/images/logo.png";
import "../../assets/styles/nav.css";

const { Search } = Input;
const { Text } = Typography;

const Navbar: React.FC = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const navigate = useNavigate();
  // Mock trạng thái đăng nhập - trong thực tế sẽ lấy từ context/auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // Lắng nghe sự kiện đăng nhập từ các component khác
useEffect(() => {
  const handleLoginEvent = (event: any) => {
    const { username } = event.detail;
    handleLoginSuccess(username); // gọi hàm đã có sẵn
  };

  window.addEventListener("login-success", handleLoginEvent);

  return () => {
    window.removeEventListener("login-success", handleLoginEvent);
  };
}, []);



  // Hàm xử lý đăng nhập thành công
  const handleLoginSuccess = (username: string) => {
    setIsLoggedIn(true);
    setUserName(username);
    // Chuyển hướng về trang chủ sau khi đăng nhập thành công
    navigate("/");
  };

  // Menu dropdown cho tài khoản
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
    },
  ];

  const handleUserMenuClick = (e: any) => {
    switch (e.key) {
      case "profile":
        navigate("/profile");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "logout":
        setIsLoggedIn(false);
        setUserName("");
        break;
    }
  };

  return (
    // Sticky navbar: luôn hiển thị khi cuộn trang
    <div
      className="navbar-wrapper"
      style={{ position: "sticky", top: 0, zIndex: 1000, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    >
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
            <Link to="/support" className="nav-top-link highlight">
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
            {/* Chỉ hiển thị wishlist khi đã đăng nhập */}
            {isLoggedIn && (
              <Badge count={3} size="small">
                <HeartOutlined className="nav-icon wishlist-icon" />
              </Badge>
            )}

            {/* User account section */}
            {isLoggedIn ? (
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick,
                }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <div className="nav-user-logged">
                  <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                  <Text strong style={{ color: "#1677ff", cursor: "pointer" }}>
                    {userName}
                  </Text>
                </div>
              </Dropdown>
            ) : (
              <div className="nav-user">
                <UserOutlined />
                <Link to="/login">Đăng nhập</Link>
                <span>/</span>
                <Link to="/register">Đăng ký</Link>
              </div>
            )}

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

          {/* User menu in drawer */}
          {isLoggedIn ? (
            <div className="drawer-user-section">
              <div className="drawer-user-info">
                <Avatar size="small" icon={<UserOutlined />} />
                <Text strong>{userName}</Text>
              </div>
              <Link to="/wishlist" onClick={() => setOpenDrawer(false)}>
                <HeartOutlined /> Danh sách yêu thích (3)
              </Link>
              <Link to="/profile" onClick={() => setOpenDrawer(false)}>
                <UserSwitchOutlined /> Thông tin cá nhân
              </Link>
              <Link to="/settings" onClick={() => setOpenDrawer(false)}>
                <SettingOutlined /> Cài đặt
              </Link>
              <Button
                type="link"
                danger
                icon={<LogoutOutlined />}
                onClick={() => {
                  setIsLoggedIn(false);
                  setUserName("");
                  setOpenDrawer(false);
                }}
                style={{ padding: 0, marginTop: 8 }}
              >
                Đăng xuất
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpenDrawer(false)}>
                Đăng nhập
              </Link>
              <Link to="/register" onClick={() => setOpenDrawer(false)}>
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default Navbar;