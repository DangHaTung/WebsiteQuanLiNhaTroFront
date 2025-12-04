import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, Button, List, Typography, Empty, Spin, Tag, Space, Divider } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { clientNotificationService, type Notification } from '../modules/client/services/notification';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text } = Typography;

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { unreadCount: socketUnreadCount, notifications: socketNotifications } = useSocket();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load notifications from API
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await clientNotificationService.getNotifications({
        page: 1,
        limit: 10,
      });
      setNotifications(response.data);
      
      // Load unread count
      const countResponse = await clientNotificationService.getUnreadCount();
      setUnreadCount(countResponse.data.count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount and when dropdown opens
  useEffect(() => {
    loadNotifications();
  }, []);

  // Update when socket notifications change
  useEffect(() => {
    if (socketNotifications.length > 0) {
      // Merge socket notifications with existing ones
      setNotifications((prev) => {
        const newNotifs = socketNotifications.filter(
          (sn) => !prev.some((pn) => pn._id === sn._id)
        );
        return [...newNotifs, ...prev].slice(0, 10);
      });
      setUnreadCount(socketUnreadCount);
    }
  }, [socketNotifications, socketUnreadCount]);

  // Mark as read
  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await clientNotificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await clientNotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await clientNotificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      if (!notifications.find((n) => n._id === notificationId)?.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Click notification
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id, {} as React.MouseEvent);
    }
    
    // Navigate if has action URL
    if (notification.actionUrl) {
      setDropdownOpen(false);
      navigate(notification.actionUrl);
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      URGENT: 'red',
      HIGH: 'orange',
      MEDIUM: 'blue',
      LOW: 'default',
    };
    return colors[priority] || 'default';
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      BILL_CREATED: '📄',
      PAYMENT_SUCCESS: '✅',
      CONTRACT_SIGNED: '📝',
      BILL_DUE_SOON: '⏰',
      SYSTEM: '🔔',
    };
    return icons[type] || '📬';
  };

  const dropdownContent = (
    <div style={{ width: 380, maxHeight: 500, overflow: 'auto' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>Thông báo</Text>
          {unreadCount > 0 && (
            <Button type="link" size="small" onClick={handleMarkAllAsRead}>
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </Space>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không có thông báo"
          style={{ padding: 40 }}
        />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              key={item._id}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: item.isRead ? 'transparent' : '#f0f7ff',
                borderLeft: item.isRead ? 'none' : '3px solid #1890ff',
              }}
              onClick={() => handleNotificationClick(item)}
              actions={[
                !item.isRead && (
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={(e) => handleMarkAsRead(item._id, e)}
                    title="Đánh dấu đã đọc"
                  />
                ),
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => handleDelete(item._id, e)}
                  danger
                  title="Xóa"
                />,
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={<span style={{ fontSize: 24 }}>{getTypeIcon(item.type)}</span>}
                title={
                  <Space>
                    <Text strong={!item.isRead}>{item.title}</Text>
                    <Tag color={getPriorityColor(item.priority)} style={{ fontSize: 10 }}>
                      {item.priority}
                    </Tag>
                  </Space>
                }
                description={
                  <>
                    <Text style={{ fontSize: 13 }}>{item.message}</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {dayjs(item.createdAt).fromNow()}
                      </Text>
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}

      <Divider style={{ margin: 0 }} />
      <div style={{ padding: '8px 16px', textAlign: 'center' }}>
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setDropdownOpen(false);
            navigate('/notifications');
          }}
        >
          Xem tất cả thông báo
        </Button>
      </div>
    </div>
  );

  return (
    <Dropdown
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      popupRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomRight"
    >
      <Badge count={unreadCount} offset={[-5, 5]} size="small">
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 20 }} />}
          style={{ border: 'none' }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
