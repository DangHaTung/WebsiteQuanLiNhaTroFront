import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Space,
  Select,
  Popconfirm,
  Button,
  message,
  Col,
  Row,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { adminComplaintService, type Complaint } from "../services/complaint";

const statusOptions = [
  { label: "Chờ xử lý", value: "PENDING" },
  { label: "Đang xử lý", value: "IN_PROGRESS" },
  { label: "Đã xử lý", value: "RESOLVED" },
];

const getStatusValue = (status?: string): string => {
  const normalizedStatus = (status || "").toUpperCase();
  switch (normalizedStatus) {
    case "PENDING":
      return "PENDING";
    case "IN_PROGRESS":
    case "INPROGRESS":
      return "IN_PROGRESS";
    case "RESOLVED":
      return "RESOLVED";
    default:
      return "PENDING";
  }
};

const statusColor = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return "#facc15";
    case "in_progress":
      return "#3b82f6"; 
    case "resolved":
      return "#22c55e"; 
    case "rejected":
      return "#ef4444";
    default:
      return "#d1d5db"; 
  }
};

const statusText = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return "Chờ xử lý";
    case "in_progress":
      return "Đang xử lý";
    case "resolved":
      return "Đã xử lý";
    case "rejected":
      return "Từ chối";
    default:
      return status || "Chờ xử lý";
  }
};

const Complaints: React.FC = () => {
  const [data, setData] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchData = async (p = page, l = limit) => {
    setLoading(true);
    try {
      const res = await adminComplaintService.list(p, l);
      setData(res.data || []);
      setTotal(res.pagination?.totalRecords || 0);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lỗi khi tải complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, limit);
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    const currentComplaint = data.find((c) => c._id === id);
    const currentStatus = (currentComplaint?.status || "").toUpperCase();

    if (currentStatus === "RESOLVED" && status !== "RESOLVED") {
      message.error(
        "Khiếu nại đã được xử lý, không thể chuyển về trạng thái trước đó"
      );
      return;
    }
    if (currentStatus === "IN_PROGRESS" && status === "PENDING") {
      message.error(
        "Khiếu nại đang xử lý, không thể chuyển về trạng thái Chờ xử lý"
      );
      return;
    }

    try {
      await adminComplaintService.updateStatus(id, status);
      message.success("Cập nhật trạng thái thành công");
      fetchData(page, limit);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminComplaintService.remove(id);
      message.success("Đã xóa complaint");
      const remaining = total - 1;
      const maxPage = Math.max(1, Math.ceil(remaining / limit));
      const nextPage = Math.min(page, maxPage);
      setPage(nextPage);
      fetchData(nextPage, limit);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Xóa complaint thất bại");
    }
  };

  const columns: ColumnsType<Complaint> = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text) => (
        <span style={{ fontWeight: 600 }}>{(text || "").trim() || "(Không có tiêu đề)"}</span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Người thuê",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 240,
      render: (v, record) => {
        const user = v || record.tenantId;
        if (!user) return <span>-</span>;
        if (typeof user === "string") return <code>{user}</code>;
        const name = user.fullName || "(Không rõ)";
        const phone = user.phone ? ` - ${user.phone}` : "";
        return <span style={{ whiteSpace: "nowrap" }}>{name}{phone}</span>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 220,
      render: (value: string, record) => {
        const currentValue = getStatusValue(value);
        const currentStatus = (value || "").toUpperCase();
        const isResolved = currentStatus === "RESOLVED";

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Tag
              color={statusColor(value)}
              style={{
                margin: 0,
                fontWeight: 600,
                minWidth: 90,
                textAlign: "center",
                borderRadius: 8,
              }}
            >
              {statusText(value)}
            </Tag>
            <Select
              size="small"
              style={{ width: "100%", borderRadius: 8 }}
              value={currentValue}
              onChange={(val) => handleStatusChange(record._id, val)}
              disabled={isResolved}
              options={statusOptions
                .filter((opt) => !isResolved || opt.value === "RESOLVED")
                .map((opt) => ({ label: opt.label, value: opt.value }))}
            />
          </div>
        );
      },
    },
    {
      title: "Tạo lúc",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (v?: string) => (v ? new Date(v).toLocaleString("vi-VN") : ""),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa khiếu nại này?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() => handleDelete(record._id)}
            >
              <Button
                shape="circle"
                type="primary"
                danger
                icon={<DeleteOutlined />}
                className="btn-hover"
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "32px auto", padding: "0 24px" }}>
      <Row
        gutter={[24, 24]}
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          background: "#fff",
          padding: 24,
        }}
      >
        {/* Header */}
        <Col span={24} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 21, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            <ExclamationCircleOutlined style={{ color: "#1890ff", fontSize: 28 }} />
            Quản lý Khiếu nại
          </span>
        </Col>

        {/* Table */}
        <Col span={24}>
          <Table
            rowKey="_id"
            loading={loading}
            columns={columns}
            dataSource={data}
            scroll={{ x: "max-content" }}
            bordered
            pagination={{
              current: page,
              pageSize: limit,
              total,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20, 50],
              onChange: (p, l) => {
                setPage(p);
                setLimit(l);
                fetchData(p, l);
              },
              showTotal: (t) => `${t} khiếu nại`,
            }}
            rowClassName={(_record, index) =>
              index % 2 === 0 ? "table-row-light" : ""
            }
          />
        </Col>
      </Row>

    </div>
  );
};

export default Complaints;
