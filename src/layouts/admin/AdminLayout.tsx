import React, { useState, useEffect } from "react";
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
  FileDoneOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  SwapOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import "../../assets/styles/layoutAd.css";
import { adminAuthService } from "../../modules/admin/services/auth";
import api from "../../modules/admin/services/api.tsx";

// Interface cho pending counts
interface PendingCounts {
  unpaidBills: number;
  pendingComplaints: number;
  pendingCheckins: number;
  draftBills: number;
  pendingMoveOut: number;
}

const { Header, Sider, Content, Footer } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [pendingCounts, setPendingCounts] = useState<PendingCounts>({
    unpaidBills: 0,
    pendingComplaints: 0,
    pendingCheckins: 0,
    draftBills: 0,
    pendingMoveOut: 0,
  });
  const navigate = useNavigate();

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const isAuthenticated = adminAuthService.isAuthenticated();
  const currentUser = adminAuthService.getCurrentUser();


  // Fetch pending counts
  useEffect(() => {
    const fetchCounts = async () => {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
      if (!token) return;

      try {
        // Fetch all data in parallel
        const [billsRes, draftsRes, complaintsRes, checkinsRes, moveOutRes] = await Promise.allSettled([
          api.get("/bills", { params: { limit: 100 } }),
          api.get("/bills/drafts", { params: { limit: 100 } }),
          api.get("/admin/complaints"),
          api.get("/checkins"),
          api.get("/move-out-requests"),
        ]);

        const counts: PendingCounts = {
          unpaidBills: 0,
          pendingComplaints: 0,
          pendingCheckins: 0,
          draftBills: 0,
          pendingMoveOut: 0,
        };

        // Bills
        if (billsRes.status === "fulfilled" && billsRes.value.data?.data) {
          const bills = billsRes.value.data.data;
          counts.unpaidBills = bills.filter((b: any) => 
            b.status === "UNPAID" || b.status === "PENDING_CASH_CONFIRM"
          ).length;
        }

        // Draft bills
        if (draftsRes.status === "fulfilled" && draftsRes.value.data?.data) {
          counts.draftBills = draftsRes.value.data.data.length;
        }

        // Complaints
        if (complaintsRes.status === "fulfilled" && complaintsRes.value.data?.data) {
          const complaints = complaintsRes.value.data.data;
          counts.pendingComplaints = complaints.filter((c: any) => 
            c.status === "PENDING" || c.status === "IN_PROGRESS"
          ).length;
        }

        // Checkins
        if (checkinsRes.status === "fulfilled" && checkinsRes.value.data?.data) {
          const checkins = checkinsRes.value.data.data;
          counts.pendingCheckins = checkins.filter((c: any) => c.status === "CREATED").length;
        }

        // Move-out requests
        if (moveOutRes.status === "fulfilled" && moveOutRes.value.data?.data) {
          const moveOuts = moveOutRes.value.data.data;
          counts.pendingMoveOut = moveOuts.filter((m: any) => 
            m.status === "PENDING" || m.status === "APPROVED"
          ).length;
        }

        console.log("✅ Final counts:", counts);
        setPendingCounts(counts);
      } catch (err) {
        console.error("Error fetching counts:", err);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "profile") navigate("/admin/profile");
    else if (e.key === "logout") adminAuthService.logout();
    else if (e.key === "login") navigate("/admin/login");
    else if (e.key === "register") navigate("/admin/register");
  };

  // Helper tạo label với badge ở cuối
  const labelWithBadge = (text: string, count: number) => (
    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <span>{text}</span>
      {count > 0 && (
        <span style={{
          background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 700,
          minWidth: 22,
          height: 22,
          borderRadius: 6,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 6px",
          boxShadow: "0 2px 6px rgba(238, 90, 36, 0.4)",
        }}>
          {count}
        </span>
      )}
    </span>
  );

  // Menu items
  const menuItems: MenuProps["items"] = [
    { key: "/admin/dashboard", icon: <DashboardOutlined style={{ fontSize: 20 }} />, label: "Dashboard" },
    { type: "divider" as const },
    { key: "/admin/roomsad", icon: <HomeOutlined style={{ fontSize: 20 }} />, label: "Quản lý phòng" },
    { key: "/admin/checkins", icon: <LoginOutlined style={{ fontSize: 20 }} />, label: labelWithBadge("Phiếu thu", pendingCounts.pendingCheckins) },
    { type: "divider" as const },
    { key: "/admin/final-contracts", icon: <SafetyCertificateOutlined style={{ fontSize: 20 }} />, label: "Hợp đồng chính thức" },
    { key: "/admin/contracts", icon: <FileDoneOutlined style={{ fontSize: 20 }} />, label: "Quản lý người ở cùng" },
    { key: "/admin/move-out-requests", icon: <SwapOutlined style={{ fontSize: 20 }} />, label: labelWithBadge("Yêu cầu chuyển đi", pendingCounts.pendingMoveOut) },
    { type: "divider" as const },
    { key: "/admin/draft-bills", icon: <FileDoneOutlined style={{ fontSize: 20 }} />, label: labelWithBadge("Hóa đơn nháp", pendingCounts.draftBills) },
    { key: "/admin/bills", icon: <FileDoneOutlined style={{ fontSize: 20 }} />, label: labelWithBadge("Hóa đơn hàng tháng", pendingCounts.unpaidBills) },
    { type: "divider" as const },
    { key: "/admin/complaints", icon: <ExclamationCircleOutlined style={{ fontSize: 20 }} />, label: labelWithBadge("Khiếu nại", pendingCounts.pendingComplaints) },
    { key: "/admin/utility-fees", icon: <SettingOutlined style={{ fontSize: 20 }} />, label: "Cấu hình tiện ích" },
    ...(currentUser?.role === "ADMIN" ? [
      { type: "divider" as const },
      { key: "/admin/users", icon: <UserOutlined style={{ fontSize: 20 }} />, label: "Người dùng" },
      { key: "/admin/logs", icon: <FileTextOutlined style={{ fontSize: 20 }} />, label: "Logs Hệ Thống" },
    ] : []),
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} trigger={null} width={280}
        style={{ background: "linear-gradient(135deg, #0d6efd, #0dcaf0)", backgroundSize: "400% 400%", animation: "gradientAnimation 15s ease infinite", transition: "all 0.3s" }}>
        <div className="logo" style={{ color: "#fff", padding: 20, textAlign: "center", fontWeight: "bold", fontSize: collapsed ? 18 : 24, transition: "all 0.3s", letterSpacing: 1 }}>
          {collapsed ? "T360" : "Tro360"}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[window.location.pathname]} onClick={({ key }) => navigate(key)} items={menuItems}
          style={{ background: "transparent", fontSize: 16, transition: "all 0.3s" }} className="dynamic-menu" />
      </Sider>


      <Layout>
        <Header style={{ padding: "0 20px", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderRadius: "0 0 12px 12px", transition: "all 0.3s" }}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: "trigger hover-animate", onClick: toggleCollapsed, style: { fontSize: 22, cursor: "pointer" }
          })}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Dropdown menu={{
              onClick: handleMenuClick,
              items: isAuthenticated
                ? [{ key: "profile", icon: <UserOutlined />, label: "Profile" }, { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất" }]
                : [{ key: "login", icon: <LoginOutlined />, label: "Đăng nhập" }, { key: "register", icon: <UserAddOutlined />, label: "Đăng ký" }],
            }} placement="bottomRight" trigger={["click"]}>
              <Tooltip title={currentUser?.fullName || currentUser?.username || "Tài khoản"}>
                <Avatar size={40} className="avatar-light-sweep" icon={<UserOutlined />} />
              </Tooltip>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: "20px" }}><Outlet /></Content>
        <Footer style={{ textAlign: "center", color: "#888", fontSize: 14, background: "#fafafa", boxShadow: "0 -2px 12px rgba(0,0,0,0.05)", borderTop: "1px solid #e8e8e8", transition: "all 0.3s" }}>
          © {new Date().getFullYear()} Tro360 Admin
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
