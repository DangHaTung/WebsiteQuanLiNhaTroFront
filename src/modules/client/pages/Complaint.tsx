import React, { useEffect, useMemo, useState } from "react";
import { Card, Form, Input, Button, List, Tag, Space, message, Popconfirm, Pagination, Empty } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { complaintService, type Complaint as ComplaintType } from "../services/complaint";
import { clientAuthService } from "../services/auth";

const { TextArea } = Input;

// Trạng thái + màu sắc
const statusColor = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return "gold";
    case "in_progress":
    case "processing":
      return "cyan";
    case "resolved":
    case "done":
      return "green";
    case "rejected":
      return "volcano";
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

const Complaint: React.FC = () => {
  const [form] = Form.useForm();
  const [items, setItems] = useState<ComplaintType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const currentUser = clientAuthService.getCurrentUser();
  const tenantId = useMemo(() => {
    const raw = currentUser?.id || "";
    return raw.replace(/\?+$/g, "");
  }, [currentUser]);
  const isLoggedIn = currentUser && tenantId;

  const loadData = async (p = page, l = limit) => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const res = await complaintService.getByTenantId(tenantId!, p, l);
      setItems(res.data || []);
      setTotal(res.pagination?.totalRecords || 0);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lỗi khi tải danh sách khiếu nại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    loadData(1, limit);
  }, [isLoggedIn]);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      let payload: any = {
        title: (values.title || "").trim(),
        description: (values.description || "").trim(),
      };
      if (isLoggedIn) payload.tenantId = tenantId;
      else {
        payload.tenantId = null;
        payload.contactName = values.contactName?.trim();
        payload.contactPhone = values.contactPhone?.trim();
        payload.contactEmail = values.contactEmail?.trim();
      }
      await complaintService.create(payload);
      message.success("Gửi khiếu nại thành công");
      form.resetFields();
      if (isLoggedIn) {
        setPage(1);
        await loadData(1, limit);
      }
    } catch (err: any) {
      const firstError = err?.response?.data?.errors?.[0]?.message;
      message.error(firstError || err?.response?.data?.message || "Lỗi khi gửi khiếu nại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await complaintService.remove(id);
      message.success("Đã xóa khiếu nại");
      const remaining = total - 1;
      const maxPage = Math.max(1, Math.ceil(remaining / limit));
      const nextPage = Math.min(page, maxPage);
      setPage(nextPage);
      await loadData(nextPage, limit);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lỗi khi xóa khiếu nại");
    }
  };

  const onChangePage = async (p: number, l?: number) => {
    const newLimit = l || limit;
    setPage(p);
    setLimit(newLimit);
    await loadData(p, newLimit);
  };

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 16px" }}>

      {/* Form gửi khiếu nại */}
      <Card
        title="Gửi khiếu nại"
        style={{
          marginBottom: 16,
          borderRadius: 16,
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        }}
      >
        {!isLoggedIn && (
          <div style={{
            background: "linear-gradient(90deg, #e6f7ff, #bae7ff)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            color: "#096dd9",
          }}>
            <strong>Lưu ý:</strong> Bạn đang gửi khiếu nại với tư cách khách hàng. Vui lòng cung cấp thông tin liên hệ để chúng tôi có thể phản hồi.
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={onFinish}>
          {!isLoggedIn && (
            <>
              <Form.Item name="contactName" label="Họ và tên" rules={[{ required: true }]}>
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
              <Form.Item name="contactPhone" label="Số điện thoại" rules={[{ required: true }]}>
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
              <Form.Item name="contactEmail" label="Email" rules={[{ required: true, type: "email" }]}>
                <Input placeholder="Nhập email" />
              </Form.Item>
            </>
          )}
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Hỏng vòi nước phòng 203" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả chi tiết" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Mô tả vấn đề, thời gian, mức độ khẩn cấp..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={submitting} className="btn-animated">
              Gửi khiếu nại
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Danh sách khiếu nại */}
      {isLoggedIn && (
        <Card
          title="Danh sách khiếu nại của bạn"
          style={{ borderRadius: 16, boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}
        >
          <List
            loading={loading}
            locale={{ emptyText: <Empty description="Chưa có khiếu nại" /> }}
            dataSource={items}
            renderItem={(item) => (
              <List.Item
                style={{
                  marginBottom: 12,
                  borderRadius: 12,
                  padding: 16,
                  background: "#fff",
                  boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
                  transition: "all 0.3s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                actions={[
                  <Popconfirm
                    key="del"
                    title="Xóa khiếu nại này?"
                    okText="Xóa"
                    cancelText="Hủy"
                    onConfirm={() => handleDelete(item._id)}
                  >
                    <Button danger shape="circle" type="primary" icon={<DeleteOutlined />} className="btn-hover"></Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space size={8} wrap>
                      <span style={{ fontWeight: 600 }}>{item.title}</span>
                      <Tag color={statusColor(item.status)} style={{ fontWeight: 500, textTransform: "uppercase" }}>
                        {statusText(item.status)}
                      </Tag>
                    </Space>
                  }
                  description={<span style={{ whiteSpace: "pre-line", color: "#555" }}>{item.description}</span>}
                />
                <div style={{ color: "#999", fontSize: 12 }}>{item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : ""}</div>
              </List.Item>
            )}
          />

          {total > 0 && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <Pagination
                current={page}
                pageSize={limit}
                total={total}
                showSizeChanger
                pageSizeOptions={[5, 10, 20, 50]}
                onChange={onChangePage}
                showTotal={(t) => `${t} khiếu nại`}
                style={{ borderRadius: 8 }}
              />
            </div>
          )}
        </Card>
      )}

      {!isLoggedIn && (
        <Card title="Thông tin bổ sung" style={{ borderRadius: 16, boxShadow: "0 6px 18px rgba(0,0,0,0.08)", marginTop: 16 }}>
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p style={{ color: "#666", marginBottom: 16 }}>
              Để theo dõi trạng thái khiếu nại và quản lý lịch sử khiếu nại, vui lòng đăng nhập vào tài khoản của bạn.
            </p>
            <Button type="primary" onClick={() => window.location.href = "/login"} style={{ borderRadius: 8 }}>
              Đăng nhập ngay
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Complaint;
