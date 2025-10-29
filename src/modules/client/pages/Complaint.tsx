import React, { useEffect, useMemo, useState } from "react";
import { Card, Form, Input, Button, List, Tag, Space, message, Popconfirm, Pagination, Empty } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { complaintService, type Complaint as ComplaintType } from "../services/complaint";
import { clientAuthService } from "../services/auth";

const { TextArea } = Input;

const statusColor = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return "gold";
    case "in_progress":
    case "processing":
      return "blue";
    case "resolved":
    case "done":
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

  // Thông báo cho khách hàng chưa đăng nhập
  const isLoggedIn = currentUser && tenantId;

  const loadData = async (p = page, l = limit) => {
    if (!isLoggedIn) return; // Chỉ load data khi đã đăng nhập
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
    if (!isLoggedIn) return; // Chỉ load data khi đã đăng nhập
    loadData(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const onFinish = async (values: { 
    title: string; 
    description: string; 
    contactName?: string; 
    contactPhone?: string; 
    contactEmail?: string; 
  }) => {
    setSubmitting(true);
    try {
      let payload: any = {
        title: (values.title || "").trim(),
        description: (values.description || "").trim(),
      };

      if (isLoggedIn) {
        // User đã đăng nhập - gửi với tenantId
        payload.tenantId = tenantId;
      } else {
        // Khách hàng chưa đăng nhập - gửi với thông tin liên hệ
        payload.tenantId = null;
        payload.contactName = values.contactName?.trim();
        payload.contactPhone = values.contactPhone?.trim();
        payload.contactEmail = values.contactEmail?.trim();
      }

      await complaintService.create(payload);
      message.success("Gửi khiếu nại thành công");
      form.resetFields();
      
      // Chỉ reload danh sách nếu user đã đăng nhập
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
      // reload current page, but if last item removed and page > 1, adjust
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
      <Card title="Gửi khiếu nại" style={{ marginBottom: 16 }}>
        {!isLoggedIn && (
          <div style={{ 
            background: "#e6f7ff", 
            border: "1px solid #91d5ff", 
            borderRadius: "6px", 
            padding: "12px 16px", 
            marginBottom: "16px" 
          }}>
            <p style={{ margin: 0, color: "#1890ff" }}>
              <strong>Lưu ý:</strong> Bạn đang gửi khiếu nại với tư cách khách hàng. 
              Vui lòng cung cấp thông tin liên hệ để chúng tôi có thể phản hồi.
            </p>
          </div>
        )}
        
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {!isLoggedIn && (
            <>
              <Form.Item
                name="contactName"
                label="Họ và tên"
                rules={[
                  { required: true, message: "Vui lòng nhập họ tên" },
                  { min: 2, message: "Họ tên phải có ít nhất 2 ký tự" },
                ]}
              > 
                <Input placeholder="Nhập họ và tên của bạn" />
              </Form.Item>
              <Form.Item
                name="contactPhone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" },
                ]}
              > 
                <Input placeholder="Nhập số điện thoại liên hệ" />
              </Form.Item>
              <Form.Item
                name="contactEmail"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              > 
                <Input placeholder="Nhập email liên hệ" />
              </Form.Item>
            </>
          )}
          
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề" },
              { min: 3, message: "Tiêu đề phải có ít nhất 3 ký tự" },
              { max: 200, message: "Tiêu đề không vượt quá 200 ký tự" },
            ]}
          > 
            <Input placeholder="Ví dụ: Hỏng vòi nước phòng 203" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả chi tiết"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả" },
              { min: 10, message: "Mô tả phải có ít nhất 10 ký tự" },
              { max: 1000, message: "Mô tả không vượt quá 1000 ký tự" },
            ]}
          > 
            <TextArea rows={4} placeholder="Mô tả vấn đề gặp phải, thời gian, mức độ khẩn cấp..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={submitting}>
              Gửi khiếu nại
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {isLoggedIn && (
        <Card title="Danh sách khiếu nại của bạn">
          <List
            loading={loading}
            locale={{ emptyText: <Empty description="Chưa có khiếu nại" /> }}
            dataSource={items}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Popconfirm
                    key="del"
                    title="Xóa khiếu nại này?"
                    okText="Xóa"
                    cancelText="Hủy"
                    onConfirm={() => handleDelete(item._id)}
                  >
                    <Button danger size="small" icon={<DeleteOutlined />}>Xóa</Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space size={8} wrap>
                      <span style={{ fontWeight: 600 }}>{item.title}</span>
                      <Tag color={statusColor(item.status)}>{statusText(item.status)}</Tag>
                    </Space>
                  }
                  description={<span style={{ whiteSpace: "pre-line" }}>{item.description}</span>}
                />
                <div style={{ color: "#999" }}>{item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : ""}</div>
              </List.Item>
            )}
          />

          {total > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <Pagination
                current={page}
                pageSize={limit}
                total={total}
                showSizeChanger
                pageSizeOptions={[5, 10, 20, 50]}
                onChange={onChangePage}
                showTotal={(t) => `${t} khiếu nại`}
              />
            </div>
          )}
        </Card>
      )}
      
      {!isLoggedIn && (
        <Card title="Thông tin bổ sung">
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p style={{ color: "#666", marginBottom: 16 }}>
              Để theo dõi trạng thái khiếu nại và quản lý lịch sử khiếu nại, 
              vui lòng đăng nhập vào tài khoản của bạn.
            </p>
            <Button type="primary" onClick={() => window.location.href = "/login"}>
              Đăng nhập ngay
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Complaint;
