import React, { useState } from "react";
import {
  Avatar,
  Dropdown,
  Layout,
  Menu,
  type MenuProps,
  Tooltip,
} from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  LoginOutlined,
  UserAddOutlined,
  FileTextOutlined,
  FileDoneOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import "../../assets/styles/layoutAd.css";
import SearchBar from "./SearchBar";
import { adminAuthService } from "../../modules/admin/services/auth";

const { Header, Sider, Content, Footer } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const isAuthenticated = adminAuthService.isAuthenticated();
  const currentUser = adminAuthService.getCurrentUser();

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "profile") {
      navigate("/admin/profile");
    } else if (e.key === "logout") {
      adminAuthService.logout();
    } else if (e.key === "login") {
      navigate("/admin/login");
    } else if (e.key === "register") {
      navigate("/admin/register");
    }
  };

  // Danh sách menu chính (ẩn Users nếu là STAFF)
  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined style={{ fontSize: 20 }} />,
      label: "Dashboard",
    },
    {
      key: "/admin/roomsad",
      icon: <HomeOutlined style={{ fontSize: 20 }} />,
      label: "Quản lý phòng",
    },
    {
      key: "/admin/contracts",
      icon: <FileDoneOutlined style={{ fontSize: 20 }} />,
      label: "Hợp đồng",
    },
    {
      key: "/admin/bills",
      icon: <FileTextOutlined style={{ fontSize: 20 }} />,
      label: "Hóa đơn",
    },
    {
      key: "/admin/complaints",
      icon: <ExclamationCircleOutlined style={{ fontSize: 20 }} />,
      label: "Khiếu nại",
    },
    // Chỉ hiển thị nếu là ADMIN
    ...(currentUser?.role === "ADMIN"
      ? [
        {
          key: "/admin/users",
          icon: <UserOutlined style={{ fontSize: 20 }} />,
          label: "Người dùng",
        },
      ]
      : []),
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        style={{
          background: "linear-gradient(135deg, #0d6efd, #0dcaf0)",
          backgroundSize: "400% 400%",
          animation: "gradientAnimation 15s ease infinite",
          transition: "all 0.3s",
        }}
      >
        <div
          className="logo"
          style={{
            color: "#fff",
            padding: 20,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: collapsed ? 18 : 24,
            transition: "all 0.3s",
            letterSpacing: 1,
          }}
        >
          {collapsed ? "T360" : "Tro360"}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[window.location.pathname]}
          onClick={({ key }: { key: string }) => navigate(key)}
          items={menuItems}
          style={{
            background: "transparent",
            fontSize: 16,
            transition: "all 0.3s",
          }}
          className="dynamic-menu"
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          style={{
            padding: "0 20px",
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            borderRadius: "0 0 12px 12px",
            transition: "all 0.3s",
            position: "sticky",
            top: 0,
            zIndex: 1000,
          }}
        >
          {React.createElement(
            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            {
              className: "trigger hover-animate",
              onClick: toggleCollapsed,
              style: { fontSize: 22, cursor: "pointer" },
            }
          )}

          <div className="header-center">
            <SearchBar />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>

            {/* User Dropdown */}
            <Dropdown
              menu={{
                onClick: handleMenuClick,
                items: isAuthenticated
                  ? [
                    {
                      key: "profile",
                      icon: <UserOutlined />,
                      label: "Profile",
                    },
                    {
                      key: "logout",
                      icon: <LogoutOutlined />,
                      label: "Đăng xuất",
                    },
                  ]
                  : [
                    {
                      key: "login",
                      icon: <LoginOutlined />,
                      label: "Đăng nhập",
                    },
                    {
                      key: "register",
                      icon: <UserAddOutlined />,
                      label: "Đăng ký",
                    },
                  ],
              }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Tooltip
                title={
                  currentUser?.fullName ||
                  currentUser?.username ||
                  "Tài khoản"
                }
              >
                <Avatar
                  size={40}
                  className="avatar-light-sweep"
                  icon={<UserOutlined />}
                />
              </Tooltip>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={{ margin: "20px" }}>
          <Outlet />
        </Content>

        {/* Footer */}
        <Footer
          style={{
            textAlign: "center",
            color: "#888",
            fontSize: 14,
            background: "#fafafa",
            boxShadow: "0 -2px 12px rgba(0,0,0,0.05)",
            borderTop: "1px solid #e8e8e8",
            transition: "all 0.3s",
          }}
        >
          © {new Date().getFullYear()} Tro360 Admin
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
