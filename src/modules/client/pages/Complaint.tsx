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
    if (!isLoggedIn) {
      message.warning("Vui lòng đăng nhập để gửi khiếu nại");
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        title: (values.title || "").trim(),
        description: (values.description || "").trim(),
        tenantId: tenantId,
      };
      
      await complaintService.create(payload);
      message.success("Gửi khiếu nại thành công");
      form.resetFields();
      setPage(1);
      await loadData(1, limit);
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

      {/* Yêu cầu đăng nhập */}
      {!isLoggedIn ? (
        <Card
          title="Gửi khiếu nại"
          style={{
            marginBottom: 16,
            borderRadius: 16,
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <h3 style={{ color: "#1890ff", marginBottom: 16 }}>Vui lòng đăng nhập</h3>
            <p style={{ color: "#666", marginBottom: 24, fontSize: 16 }}>
              Bạn cần đăng nhập để gửi khiếu nại và theo dõi trạng thái xử lý.
            </p>
            <Button 
              type="primary" 
              size="large"
              onClick={() => window.location.href = "/login"} 
              style={{ borderRadius: 8, height: 48, fontSize: 16 }}
            >
              Đăng nhập ngay
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Form gửi khiếu nại */}
          <Card
            title="Gửi khiếu nại"
            style={{
              marginBottom: 16,
              borderRadius: 16,
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
          >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}>
                <Input placeholder="Ví dụ: Hỏng vòi nước phòng 203" size="large" />
              </Form.Item>
              <Form.Item name="description" label="Mô tả chi tiết" rules={[{ required: true, message: "Vui lòng mô tả chi tiết" }]}>
                <TextArea rows={4} placeholder="Mô tả vấn đề, thời gian, mức độ khẩn cấp..." size="large" />
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<PlusOutlined />} 
                  loading={submitting} 
                  size="large"
                  className="btn-animated"
                >
                  Gửi khiếu nại
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </>
      )}

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


    </div>
  );
};

export default Complaint;
