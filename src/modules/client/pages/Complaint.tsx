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

  const loadData = async (p = page, l = limit) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await complaintService.getByTenantId(tenantId, p, l);
      setItems(res.data || []);
      setTotal(res.pagination?.totalRecords || 0);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lỗi khi tải danh sách khiếu nại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tenantId) return;
    loadData(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const onFinish = async (values: { title: string; description: string }) => {
    if (!tenantId) {
      message.warning("Vui lòng đăng nhập để gửi khiếu nại");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        tenantId,
        title: (values.title || "").trim(),
        description: (values.description || "").trim(),
      };
      await complaintService.create(payload);
      message.success("Gửi khiếu nại thành công");
      form.resetFields();
      // reload first page
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
        <Form form={form} layout="vertical" onFinish={onFinish}>
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
    </div>
  );
};

export default Complaint;
