import React, { useState } from "react";
import { Avatar, Badge, Dropdown, Layout, Menu, type MenuProps } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import { MenuFoldOutlined, MenuUnfoldOutlined, DashboardOutlined, UserOutlined, BellOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import "../../assets/styles/layoutAd.css";
import SearchBar from "./SearchBar";

const { Header, Sider, Content, Footer } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === "profile") {
      navigate("/admin/profile");
    } else if (e.key === "logout") {
      console.log("Logout clicked");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        style={{
          background: "linear-gradient(135deg, #1677ff, #69b1ff)",
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
          onClick={({ key }) => navigate(key)}
          items={[
            {
              key: "/admin/dashboard",
              icon: <DashboardOutlined style={{ fontSize: 20 }} />,
              label: "Dashboard",
            },
            {
              key: "/admin/users",
              icon: <UserOutlined style={{ fontSize: 20 }} />,
              label: "Users",
            },
          ]}
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

          <SearchBar onSearch={(value) => console.log("Searching:", value)} />

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>

            {/* Notification Icon */}
            <Badge count={5} offset={[0, 0]}>
              <BellOutlined className="icon-light-sweep" />
            </Badge>

            {/* User Dropdown */}
            <Dropdown
              overlay={
                <Menu
                  onClick={handleMenuClick}
                  items={[
                    { key: "profile", icon: <SettingOutlined />, label: "Profile" },
                    { key: "logout", icon: <LogoutOutlined />, label: "Logout" },
                  ]}
                />
              }
              placement="bottomRight"
              trigger={["click"]}
            >
              <Avatar size={40} className="avatar-light-sweep" icon={<UserOutlined />} />
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={{ margin: "20px" }}>
          <div
            style={{
              padding: 30,
              minHeight: 360,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              transition: "all 0.3s",
            }}
            className="content-card hover-animate"
          >
            <Outlet />
          </div>
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
