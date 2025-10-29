import React, { useEffect, useState } from "react";
import { Card, Table, Tag, Space, Select, Popconfirm, Button, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { adminComplaintService, type Complaint } from "../services/complaint";
import "../../../assets/styles/dashboard.css";

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
      return "gold";
    case "in_progress":
    case "processing":
      return "blue";
    case "resolved":
      return "green";
    case "rejected":
      return "red";
    default:
      return "default";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    // Kiểm tra xem complaint hiện tại có trạng thái gì
    const currentComplaint = data.find(c => c._id === id);
    const currentStatus = (currentComplaint?.status || "").toUpperCase();
    
    // Nếu đã RESOLVED, không cho chuyển về trạng thái cũ
    if (currentStatus === "RESOLVED" && status !== "RESOLVED") {
      message.error("Khiếu nại đã được xử lý, không thể chuyển về trạng thái trước đó");
      return;
    }
    // Không cho chuyển từ IN_PROGRESS -> PENDING
    if (currentStatus === "IN_PROGRESS" && status === "PENDING") {
      message.error("Khiếu nại đang xử lý, không thể chuyển về trạng thái Chờ xử lý");
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
      render: (text, record) => (
        <span style={{ fontWeight: 600 }}>
          {(text || "").trim() || "(Không có tiêu đề)"}
        </span>
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
        // Ưu tiên hiển thị tài khoản client đã gửi khiếu nại
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
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Tag color={statusColor(value)} style={{ margin: 0 }}>
              {statusText(value)}
            </Tag>
            <Select
              size="small"
              style={{ width: "100%" }}
              value={currentValue}
              onChange={(val) => handleStatusChange(record._id, val)}
              disabled={isResolved}
            >
              {statusOptions
                .filter(opt => !isResolved || opt.value === "RESOLVED")
                .map(opt => (
                  <Select.Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Option>
                ))}
            </Select>
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
      width: 120,
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Xóa complaint này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "24px auto", padding: "0 16px" }}>
      <Card
        title="Quản lý Khiếu nại"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchData(page, limit)}>
              Tải lại
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="_id"
          loading={loading}
          className="no-row-hover"
          columns={columns}
          dataSource={data}
          scroll={{ x: 1200 }}
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
        />
      </Card>
    </div>
  );
};

export default Complaints;
