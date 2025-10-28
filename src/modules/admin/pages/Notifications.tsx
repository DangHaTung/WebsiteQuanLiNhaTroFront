import React, { useEffect, useState } from "react";
import { Card, List, Badge, Button, Space, message, Popconfirm, Empty, Typography } from "antd";
import { BellOutlined, DeleteOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { adminNotificationService, type Notification } from "../services/notification";

const { Title } = Typography;

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notifRes, countRes] = await Promise.all([
        adminNotificationService.list(1, 50),
        adminNotificationService.getUnreadCount(),
      ]);
      setNotifications(notifRes.data || []);
      setUnreadCount(countRes.data?.count || 0);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lỗi khi tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await adminNotificationService.markAsRead(id);
      message.success("Đã đánh dấu đọc");
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lỗi khi đánh dấu đọc");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await adminNotificationService.markAllAsRead();
      message.success("Đã đánh dấu tất cả là đã đọc");
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lỗi khi đánh dấu đọc");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminNotificationService.remove(id);
      message.success("Đã xóa thông báo");
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lỗi khi xóa thông báo");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "COMPLAINT_NEW":
        return "📢";
      case "BILL_NEW":
        return "💵";
      case "CONTRACT_NEW":
        return "📝";
      case "PAYMENT_SUCCESS":
        return "✅";
      default:
        return "🔔";
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 16px" }}>
      <Card
        title={
          <Space>
            <BellOutlined />
            <span>Thông báo</span>
            {unreadCount > 0 && <Badge count={unreadCount} />}
          </Space>
        }
        extra={
          unreadCount > 0 && (
            <Button icon={<CheckCircleOutlined />} onClick={handleMarkAllAsRead}>
              Đánh dấu tất cả đã đọc
            </Button>
          )
        }
      >
        <List
          loading={loading}
          locale={{
            emptyText: <Empty description="Không có thông báo nào" />,
          }}
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{
                backgroundColor: item.isRead ? "#fff" : "#f0f7ff",
                borderLeft: item.isRead ? "2px solid transparent" : "2px solid #1890ff",
                padding: "12px 16px",
                marginBottom: 8,
                borderRadius: 4,
              }}
            >
              <List.Item.Meta
                avatar={<span style={{ fontSize: 24 }}>{getNotificationIcon(item.type)}</span>}
                title={
                  <Space>
                    <span style={{ fontWeight: item.isRead ? 400 : 600 }}>{item.title}</span>
                    {!item.isRead && <Badge dot color="red" />}
                  </Space>
                }
                description={
                  <>
                    <p style={{ marginBottom: 4 }}>{item.message}</p>
                    <small style={{ color: "#999" }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : ""}
                    </small>
                  </>
                }
              />
              <Space>
                {!item.isRead && (
                  <Button size="small" onClick={() => handleMarkAsRead(item._id)}>
                    Đánh dấu đọc
                  </Button>
                )}
                <Popconfirm
                  title="Xóa thông báo này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => handleDelete(item._id)}
                >
                  <Button danger size="small" icon={<DeleteOutlined />}>
                    Xóa
                  </Button>
                </Popconfirm>
              </Space>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Notifications;


