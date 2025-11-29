import React, { useState } from "react";
import { Modal, Form, Input, message } from "antd";

// Props cho Modal thêm người ở cùng
interface AddCoTenantModalProps {
  visible: boolean;               // Hiển thị modal hay không
  onCancel: () => void;           // Hàm khi bấm nút hủy
  onSuccess: () => void;          // Hàm callback khi thêm thành công
  contractId: string;             // ID hợp đồng để thêm người ở cùng
  roomNumber: string;             // Số phòng hiển thị trên modal
}

// Dữ liệu form người ở cùng
interface CoTenantFormData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  identityNo?: string;
}

const AddCoTenantModal: React.FC<AddCoTenantModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  contractId,
  roomNumber,
}) => {
  const [form] = Form.useForm<CoTenantFormData>();   // Form instance
  const [loading, setLoading] = useState(false);      // Loading khi submit

  // Xử lý submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();    // Validate dữ liệu form
      setLoading(true);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("token");   // Lấy token người dùng

      // Gửi API thêm người ở cùng + tạo tài khoản
      const response = await fetch(`${apiUrl}/api/contracts/${contractId}/add-cotenant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: values.fullName,
          phone: values.phone,
          email: values.email,
          password: values.password,
          identityNo: values.identityNo,
        }),
      });

      const data = await response.json();

      if (data.success) {
        message.success("Thêm người ở cùng thành công!");
        form.resetFields();          // Reset lại form
        onSuccess();                 // Callback cho cha
      } else {
        message.error(data.message || "Lỗi khi thêm người ở cùng");
      }
    } catch (error: any) {
      console.error("Error adding co-tenant:", error);
      message.error("Lỗi khi thêm người ở cùng");
    } finally {
      setLoading(false);             // Tắt loading
    }
  };

  return (
    <Modal
      title={`Thêm người ở cùng - Phòng ${roomNumber}`}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}            // Submit form khi bấm OK
      confirmLoading={loading}
      okText="Thêm người ở cùng"
      cancelText="Hủy"
      width={600}
    >
      {/* Form nhập thông tin người ở cùng */}
      <Form form={form} layout="vertical">
        <Form.Item
          label="Họ tên"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
        >
          <Input placeholder="Nguyễn Văn B" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại" },
            { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ" },
          ]}
        >
          <Input placeholder="0987654321" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="email@example.com" type="email" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
          ]}
        >
          <Input.Password placeholder="Mật khẩu để đăng nhập" />
        </Form.Item>

        <Form.Item label="CCCD/CMND" name="identityNo">
          <Input placeholder="123456789" />
        </Form.Item>

        {/* Ghi chú hiển thị bên dưới */}
        <div style={{ padding: 12, background: "#f0f2f5", borderRadius: 4 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
            💡 <strong>Lưu ý:</strong> Hệ thống sẽ tạo tài khoản cho người ở cùng. Họ có thể đăng nhập bằng email và mật khẩu để xem hóa đơn hàng tháng. Chỉ người thuê chính mới có thể thanh toán.
          </p>
        </div>
      </Form>
    </Modal>
  );
};

export default AddCoTenantModal;
