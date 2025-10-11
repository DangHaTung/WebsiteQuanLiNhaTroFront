import React from "react";
import { Dropdown, Avatar, Typography, message } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Text } = Typography;

const UserMenu: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <div className="nav-user">
        <UserOutlined />
        <Link to="/login">Đăng nhập</Link>
        <span>/</span>
        <Link to="/register">Đăng ký</Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    message.success("Đăng xuất thành công!");
    navigate("/");
  };

  const menuItems = [
    {
      key: "profile",
      icon: <ProfileOutlined />,
      label: <Link to="/profile">Thông tin cá nhân</Link>,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: <Link to="/settings">Cài đặt</Link>,
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={["click"]}
    >
      <div className="nav-user-dropdown">
        <Avatar
          icon={<UserOutlined />}
          style={{
            backgroundColor: "#3b82f6",
            cursor: "pointer",
            marginRight: "8px",
          }}
        />
        <Text strong style={{ cursor: "pointer", color: "#3b82f6" }}>
          {user.username || user.email}
        </Text>
      </div>
    </Dropdown>
  );
};

export default UserMenu;
