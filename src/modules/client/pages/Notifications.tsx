import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Typography,
  Tag,
  Button,
  Space,
  Empty,
  Spin,
  Pagination,
  Select,
  Row,
  Col,
  Statistic,
  message,
} from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { clientNotificationService, type Notification } from '../services/notification';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text, Title } = Typography;
const { Option } = Select;

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    isRead: undefined as boolean | undefined,
    type: undefined as string | undefined,
  });
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await clientNotificationService.getNotifications({
        page: pagination.current,
        limit: pagination.pageSize,
        isRead: filters.isRead,
        type: filters.type,
      });
      
      setNotifications(response.data);
      setPagination({
        ...pagination,
        total: response.pagination.total,
      });

      // Load unread count
      const countResponse = await clientNotificationService.getUnreadCount();
      setUnreadCount(countResponse.data.count);
    } catch (error) {
      console.error('Error loading notifications:', error);
      message.error('Lỗi khi tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [pagination.current, pagination.pageSize, filters]);

  // Mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await clientNotificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      message.success('Đã đánh dấu đã đọc');
    } catch (error) {
      message.error('Lỗi khi đánh dấu đã đọc');
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await clientNotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      message.success('Đã đánh dấu tất cả đã đọc');
    } catch (error) {
      message.error('Lỗi khi đánh dấu tất cả đã đọc');
    }
  };

  // Delete notification
  const handleDelete = async (notificationId: string) => {
    try {
      await clientNotificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      message.success('Đã xóa thông báo');
      loadNotifications(); // Reload to update pagination
    } catch (error) {
      message.error('Lỗi khi xóa thông báo');
    }
  };

  // Delete all read
  const handleDeleteAllRead = async () => {
    try {
      await clientNotificationService.deleteAllRead();
      message.success('Đã xóa tất cả thông báo đã đọc');
      loadNotifications();
    } catch (error) {
      message.error('Lỗi khi xóa thông báo');
    }
  };

  // Click notification
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }
    
    if (notification.actionUrl) {
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

  // Get type text
  const getTypeText = (type: string) => {
    const texts: Record<string, string> = {
      BILL_CREATED: 'Hóa đơn mới',
      PAYMENT_SUCCESS: 'Thanh toán thành công',
      CONTRACT_SIGNED: 'Hợp đồng đã ký',
      BILL_DUE_SOON: 'Hóa đơn sắp đến hạn',
      SYSTEM: 'Hệ thống',
    };
    return texts[type] || type;
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

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={2}>
          <BellOutlined /> Thông báo
        </Title>

        {/* Stats */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng thông báo"
                value={pagination.total}
                prefix={<BellOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Chưa đọc"
                value={unreadCount}
                valueStyle={{ color: '#1890ff' }}
                prefix={<BellOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Đã đọc"
                value={pagination.total - unreadCount}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters & Actions */}
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
          <Space wrap>
            <Select
              placeholder="Trạng thái"
              style={{ width: 150 }}
              allowClear
              value={filters.isRead}
              onChange={(value) => setFilters({ ...filters, isRead: value })}
            >
              <Option value={false}>Chưa đọc</Option>
              <Option value={true}>Đã đọc</Option>
            </Select>

            <Select
              placeholder="Loại thông báo"
              style={{ width: 180 }}
              allowClear
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
            >
              <Option value="BILL_CREATED">Hóa đơn mới</Option>
              <Option value="PAYMENT_SUCCESS">Thanh toán thành công</Option>
              <Option value="CONTRACT_SIGNED">Hợp đồng đã ký</Option>
              <Option value="BILL_DUE_SOON">Hóa đơn sắp đến hạn</Option>
              <Option value="SYSTEM">Hệ thống</Option>
            </Select>

            <Button icon={<ReloadOutlined />} onClick={loadNotifications}>
              Làm mới
            </Button>
          </Space>

          <Space>
            {unreadCount > 0 && (
              <Button type="primary" onClick={handleMarkAllAsRead}>
                Đánh dấu tất cả đã đọc
              </Button>
            )}
            <Button danger onClick={handleDeleteAllRead}>
              Xóa thông báo đã đọc
            </Button>
          </Space>
        </Space>

        {/* Notifications List */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có thông báo"
            style={{ padding: 40 }}
          />
        ) : (
          <>
            <List
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item
                  key={item._id}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: item.isRead ? 'transparent' : '#f0f7ff',
                    borderLeft: item.isRead ? 'none' : '4px solid #1890ff',
                    padding: '16px',
                  }}
                  onClick={() => handleNotificationClick(item)}
                  actions={[
                    !item.isRead && (
                      <Button
                        type="text"
                        icon={<CheckOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(item._id);
                        }}
                      >
                        Đánh dấu đã đọc
                      </Button>
                    ),
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item._id);
                      }}
                    >
                      Xóa
                    </Button>,
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={<span style={{ fontSize: 32 }}>{getTypeIcon(item.type)}</span>}
                    title={
                      <Space>
                        <Text strong={!item.isRead} style={{ fontSize: 16 }}>
                          {item.title}
                        </Text>
                        <Tag color={getPriorityColor(item.priority)}>{item.priority}</Tag>
                        <Tag>{getTypeText(item.type)}</Tag>
                      </Space>
                    }
                    description={
                      <>
                        <Text style={{ fontSize: 14 }}>{item.message}</Text>
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')} (
                            {dayjs(item.createdAt).fromNow()})
                          </Text>
                        </div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />

            {/* Pagination */}
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                showSizeChanger
                showTotal={(total) => `Tổng ${total} thông báo`}
                onChange={(page, pageSize) => {
                  setPagination({ ...pagination, current: page, pageSize: pageSize || 20 });
                }}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Notifications;
