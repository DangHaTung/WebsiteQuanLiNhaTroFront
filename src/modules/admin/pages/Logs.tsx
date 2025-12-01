import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Tag,
  Space,
  Select,
  DatePicker,
  Button,
  message,
  Row,
  Col,
  Statistic,
  Modal,
  Descriptions,
  Typography,
} from "antd";
import {
  InfoCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { adminLogService, type Log } from "../services/log";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

const Logs = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [stats, setStats] = useState({
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    level: undefined as string | undefined,
    entity: undefined as string | undefined,
    dateRange: undefined as [dayjs.Dayjs, dayjs.Dayjs] | undefined,
  });

  // Detail modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      if (filters.level) params.level = filters.level;
      if (filters.entity) params.entity = filters.entity;
      if (filters.dateRange) {
        params.startDate = filters.dateRange[0].toISOString();
        params.endDate = filters.dateRange[1].toISOString();
      }

      const response = await adminLogService.getAll(params);
      setLogs(response.data);
      setPagination({
        ...pagination,
        total: response.pagination.totalRecords,
      });
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tải logs");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const params: any = {};
      if (filters.dateRange) {
        params.startDate = filters.dateRange[0].toISOString();
        params.endDate = filters.dateRange[1].toISOString();
      }

      const response = await adminLogService.getStats(params);
      setStats(response.data.summary);
    } catch (error) {
      console.error("Load stats error:", error);
    }
  };

  const handleCleanup = async () => {
    Modal.confirm({
      title: "Xóa logs cũ",
      content: "Bạn có chắc muốn xóa logs cũ hơn 30 ngày?",
      onOk: async () => {
        try {
          const result = await adminLogService.cleanup({ days: 30 });
          message.success(`Đã xóa ${result.data.deletedCount} logs`);
          loadLogs();
          loadStats();
        } catch (error: any) {
          message.error(error.response?.data?.message || "Lỗi khi xóa logs");
        }
      },
    });
  };

  const getLevelTag = (level: string) => {
    const config = {
      INFO: { color: "blue", icon: <InfoCircleOutlined /> },
      WARN: { color: "orange", icon: <WarningOutlined /> },
      ERROR: { color: "red", icon: <CloseCircleOutlined /> },
    };
    const c = config[level as keyof typeof config] || config.INFO;
    return (
      <Tag color={c.color} icon={c.icon}>
        {level}
      </Tag>
    );
  };

  const getEntityTag = (entity: string) => {
    const colors: Record<string, string> = {
      ROOM: "purple",
      CONTRACT: "cyan",
      BILL: "green",
      USER: "blue",
      CHECKIN: "magenta",
      FINALCONTRACT: "gold",
      PAYMENT: "lime",
    };
    return <Tag color={colors[entity] || "default"}>{entity}</Tag>;
  };

  const renderDiffDetails = (diff: any) => {
    if (!diff) return null;

    const formatValue = (value: any): string => {
      if (value === null || value === undefined) return "Không có";
      if (typeof value === "boolean") return value ? "Có" : "Không";
      if (typeof value === "number") {
        // Format số tiền
        if (value > 1000) {
          return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
        }
        return String(value);
      }
      if (typeof value === "object") {
        if (Array.isArray(value)) return `[${value.length} mục]`;
        return JSON.stringify(value, null, 2);
      }
      return String(value);
    };

    const translateField = (field: string): string => {
      const translations: Record<string, string> = {
        action: "Hành động",
        before: "Trước",
        after: "Sau",
        roomNumber: "Số phòng",
        status: "Trạng thái",
        pricePerMonth: "Giá thuê/tháng",
        area: "Diện tích",
        capacity: "Sức chứa",
        description: "Mô tả",
        fullName: "Họ tên",
        email: "Email",
        phone: "Số điện thoại",
        role: "Vai trò",
        tenantName: "Tên khách thuê",
        month: "Tháng",
        amount: "Số tiền",
        provider: "Nhà cung cấp",
        dueDate: "Hạn thanh toán",
        paidDate: "Ngày thanh toán",
        isPaid: "Đã thanh toán",
        type: "Loại",
        billType: "Loại hóa đơn",
        startDate: "Ngày bắt đầu",
        endDate: "Ngày kết thúc",
        deposit: "Tiền cọc",
        monthlyRent: "Tiền thuê hàng tháng",
        paymentMethod: "Phương thức thanh toán",
        transactionId: "Mã giao dịch",
        data: "Dữ liệu",
        AVAILABLE: "Còn trống",
        OCCUPIED: "Đã thuê",
        MAINTENANCE: "Bảo trì",
        MONTHLY: "Hàng tháng",
        CONTRACT: "Hợp đồng",
        RECEIPT: "Phiếu thu",
        CREATE: "Tạo mới",
        UPDATE: "Cập nhật",
        DELETE: "Xóa",
        PAYMENT: "Thanh toán",
        SUCCESS: "Thành công",
        FAILED: "Thất bại",
        PENDING: "Đang xử lý",
        ADMIN: "Quản trị viên",
        TENANT: "Khách thuê",
        VNPAY: "VNPay",
        ZALOPAY: "ZaloPay",
        CASH: "Tiền mặt",
      };
      return translations[field] || field;
    };

    const renderObject = (obj: any, title: string) => {
      if (!obj || typeof obj !== "object") return null;
      
      return (
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {title}:
          </Text>
          <div style={{ paddingLeft: 16 }}>
            {Object.entries(obj).map(([key, value]) => (
              <div key={key} style={{ marginBottom: 4 }}>
                <Text type="secondary">{translateField(key)}:</Text>{" "}
                <Text>{translateField(formatValue(value))}</Text>
              </div>
            ))}
          </div>
        </div>
      );
    };

    // Xử lý riêng cho từng loại action
    if (diff.action === 'PAYMENT') {
      return (
        <div style={{ maxHeight: 400, overflow: "auto" }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>Loại hành động: </Text>
            <Tag color="green">Thanh toán</Tag>
          </div>
          
          {diff.amount && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Số tiền thanh toán: </Text>
              <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                {formatValue(diff.amount)}
              </Text>
            </div>
          )}
          
          {diff.provider && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Phương thức thanh toán: </Text>
              <Tag color="blue">{translateField(diff.provider)}</Tag>
            </div>
          )}
          
          {diff.status && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Trạng thái thanh toán: </Text>
              <Tag color={diff.status === 'SUCCESS' ? 'success' : 'error'}>
                {translateField(diff.status)}
              </Tag>
            </div>
          )}

          {diff.billType && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Loại hóa đơn: </Text>
              <Tag color={diff.billType === 'MONTHLY' ? 'cyan' : diff.billType === 'CONTRACT' ? 'gold' : 'purple'}>
                {translateField(diff.billType)}
              </Tag>
            </div>
          )}

          {diff.roomNumber && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Phòng: </Text>
              <Text strong>{diff.roomNumber}</Text>
            </div>
          )}

          {diff.tenantName && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Khách thuê: </Text>
              <Text strong>{diff.tenantName}</Text>
            </div>
          )}

          {diff.month && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary">Tháng: </Text>
              <Text>{diff.month}</Text>
            </div>
          )}
        </div>
      );
    }

    if (diff.action === 'CREATE') {
      return (
        <div style={{ maxHeight: 400, overflow: "auto" }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>Loại hành động: </Text>
            <Tag color="blue">Tạo mới</Tag>
          </div>
          {diff.data && renderObject(diff.data, "Thông tin")}
        </div>
      );
    }

    if (diff.action === 'UPDATE') {
      return (
        <div style={{ maxHeight: 400, overflow: "auto" }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>Loại hành động: </Text>
            <Tag color="orange">Cập nhật</Tag>
          </div>
          {diff.before && renderObject(diff.before, "Trước khi thay đổi")}
          {diff.after && renderObject(diff.after, "Sau khi thay đổi")}
        </div>
      );
    }

    if (diff.action === 'DELETE') {
      return (
        <div style={{ maxHeight: 400, overflow: "auto" }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>Loại hành động: </Text>
            <Tag color="red">Xóa</Tag>
          </div>
          {diff.data && renderObject(diff.data, "Thông tin đã xóa")}
        </div>
      );
    }

    // Fallback cho các trường hợp khác
    return (
      <div style={{ maxHeight: 400, overflow: "auto" }}>
        {diff.action && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>Hành động: </Text>
            <Tag color="blue">{translateField(diff.action)}</Tag>
          </div>
        )}
        
        {diff.before && renderObject(diff.before, "Trước khi thay đổi")}
        {diff.after && renderObject(diff.after, "Sau khi thay đổi")}
        {diff.data && renderObject(diff.data, "Dữ liệu")}
        
        {!diff.before && !diff.after && !diff.data && diff.action && (
          <Text type="secondary">Không có thông tin chi tiết</Text>
        )}
      </div>
    );
  };

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: "Mức độ",
      dataIndex: "level",
      key: "level",
      width: 100,
      render: (level: string) => getLevelTag(level),
    },
    {
      title: "Đối tượng",
      dataIndex: ["context", "entity"],
      key: "entity",
      width: 120,
      render: (entity: string) => getEntityTag(entity),
    },
    {
      title: "Thông báo",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
    },
    {
      title: "Người thực hiện",
      dataIndex: ["context", "actorId"],
      key: "actor",
      width: 150,
      render: (actor: any) => (actor ? actor.fullName : <Text type="secondary">Hệ thống</Text>),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_: any, record: Log) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedLog(record);
            setDetailModalVisible(true);
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <h2>Logs Hệ Thống</h2>

        {/* Stats */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Tổng logs"
                value={stats.total}
                prefix={<InfoCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Thông tin"
                value={stats.info}
                valueStyle={{ color: "#1890ff" }}
                prefix={<InfoCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Cảnh báo"
                value={stats.warnings}
                valueStyle={{ color: "#faad14" }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Lỗi"
                value={stats.errors}
                valueStyle={{ color: "#ff4d4f" }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            placeholder="Mức độ"
            style={{ width: 120 }}
            allowClear
            value={filters.level}
            onChange={(value) => setFilters({ ...filters, level: value })}
          >
            <Option value="INFO">Thông tin</Option>
            <Option value="WARN">Cảnh báo</Option>
            <Option value="ERROR">Lỗi</Option>
          </Select>

          <Select
            placeholder="Đối tượng"
            style={{ width: 150 }}
            allowClear
            value={filters.entity}
            onChange={(value) => setFilters({ ...filters, entity: value })}
          >
            <Option value="ROOM">Phòng</Option>
            <Option value="CONTRACT">Hợp đồng nháp</Option>
            <Option value="BILL">Hóa đơn</Option>
            <Option value="USER">Người dùng</Option>
            <Option value="CHECKIN">Checkin</Option>
            <Option value="FINALCONTRACT">Hợp đồng</Option>
            <Option value="PAYMENT">Thanh toán</Option>
          </Select>

          <RangePicker
            value={filters.dateRange}
            onChange={(dates) =>
              setFilters({ ...filters, dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs] })
            }
            format="DD/MM/YYYY"
          />

          <Button icon={<ReloadOutlined />} onClick={loadLogs}>
            Làm mới
          </Button>

          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={handleCleanup}
          >
            Xóa logs cũ
          </Button>
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} logs`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize: pageSize || 10 });
            },
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết Log"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedLog && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="ID">{selectedLog._id}</Descriptions.Item>
            <Descriptions.Item label="Mức độ">{getLevelTag(selectedLog.level)}</Descriptions.Item>
            <Descriptions.Item label="Đối tượng">
              {getEntityTag(selectedLog.context.entity)}
            </Descriptions.Item>
            <Descriptions.Item label="Mã đối tượng">
              <code>{selectedLog.context.entityId}</code>
            </Descriptions.Item>
            <Descriptions.Item label="Thông báo">{selectedLog.message}</Descriptions.Item>
            <Descriptions.Item label="Người thực hiện">
              {selectedLog.context.actorId ? (
                <div>
                  <div>{selectedLog.context.actorId.fullName}</div>
                  <Text type="secondary">{selectedLog.context.actorId.email}</Text>
                </div>
              ) : (
                <Text type="secondary">Hệ thống</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              {dayjs(selectedLog.createdAt).format("DD/MM/YYYY HH:mm:ss")}
            </Descriptions.Item>
            {selectedLog.context.diff && (
              <Descriptions.Item label="Chi tiết thay đổi">
                {renderDiffDetails(selectedLog.context.diff)}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Logs;
