import React, { useState, useEffect } from "react";
import { Modal, Form, Input, message, Select, Divider } from "antd";
import { UserAddOutlined } from "@ant-design/icons";

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
  existingUserId?: string;
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
  const [users, setUsers] = useState<any[]>([]);      // Danh sách users trong hệ thống
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null); // User đã chọn

  // Load danh sách users khi modal mở
  useEffect(() => {
    if (visible) {
      loadUsers();
    } else {
      // Reset khi đóng modal
      setSelectedUserId(null);
      form.resetFields();
    }
  }, [visible]);

  // Load danh sách users từ API
  const loadUsers = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("token");

      console.log("[AddCoTenantModal] Loading users from API...");
      const response = await fetch(`${apiUrl}/api/users?limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("[AddCoTenantModal] Users response:", data);
      
      if (data.success) {
        const userList = data.data || [];
        console.log(`[AddCoTenantModal] Loaded ${userList.length} users`);
        setUsers(userList);
      } else {
        console.error("[AddCoTenantModal] Failed to load users:", data.message);
        message.error("Không thể tải danh sách người dùng");
      }
    } catch (error) {
      console.error("[AddCoTenantModal] Error loading users:", error);
      message.error("Lỗi khi tải danh sách người dùng");
    }
  };

  // Xử lý khi chọn user từ dropdown
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find((u) => u._id === userId);
    
    if (user) {
      // Auto-fill thông tin từ user đã chọn
      form.setFieldsValue({
        existingUserId: userId,
        fullName: user.fullName || "",
        phone: user.phone || "",
        email: user.email || "",
        identityNo: user.identityNo || "",
      });
      
      // Không cần password nếu chọn user có sẵn
      form.setFields([
        { name: 'password', errors: [] }
      ]);
    }
  };

  // Xử lý khi xóa lựa chọn user
  const handleUserDeselect = () => {
    setSelectedUserId(null);
    form.resetFields();
  };

  // Xử lý submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();    // Validate dữ liệu form
      setLoading(true);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = localStorage.getItem("token");   // Lấy token người dùng

      // Nếu chọn user có sẵn, gửi existingUserId
      // Nếu không, gửi thông tin mới để tạo tài khoản
      const payload: any = {
        fullName: values.fullName,
        phone: values.phone,
        email: values.email,
        identityNo: values.identityNo,
      };

      if (selectedUserId) {
        // Chọn user có sẵn
        payload.existingUserId = selectedUserId;
      } else {
        // Tạo user mới - cần password
        if (!values.password) {
          message.error("Vui lòng nhập mật khẩu cho người dùng mới");
          setLoading(false);
          return;
        }
        payload.password = values.password;
      }

      // Gửi API thêm người ở cùng
      const response = await fetch(`${apiUrl}/api/contracts/${contractId}/add-cotenant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        message.success("Thêm người ở cùng thành công!");
        form.resetFields();          // Reset lại form
        setSelectedUserId(null);     // Reset selected user
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
          label={
            <span>
              <UserAddOutlined /> Chọn người (nếu đã có trong hệ thống)
            </span>
          }
          name="existingUserId"
          tooltip="Nếu người này đã có tài khoản trong hệ thống, chọn từ danh sách. Nếu không, bỏ trống và điền thông tin mới bên dưới."
        >
          <Select
            showSearch
            allowClear
            placeholder="Tìm và chọn người dùng có sẵn..."
            optionFilterProp="children"
            onChange={handleUserSelect}
            onClear={handleUserDeselect}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={users.map((user) => ({
              value: user._id,
              label: `${user.fullName} - ${user.phone || user.email}`,
            }))}
          />
        </Form.Item>

        <Divider style={{ margin: "12px 0" }}>
          {selectedUserId ? "Thông tin người đã chọn" : "Hoặc thêm người mới"}
        </Divider>

        <Form.Item
          label="Họ tên"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
        >
          <Input placeholder="Nguyễn Văn B" disabled={!!selectedUserId} />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại" },
            { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ" },
          ]}
        >
          <Input placeholder="0987654321" disabled={!!selectedUserId} />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="email@example.com" type="email" disabled={!!selectedUserId} />
        </Form.Item>

        {!selectedUserId && (
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: !selectedUserId, message: "Vui lòng nhập mật khẩu" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
            ]}
          >
            <Input.Password placeholder="Mật khẩu để đăng nhập" />
          </Form.Item>
        )}

        <Form.Item label="CCCD/CMND" name="identityNo">
          <Input placeholder="123456789" disabled={!!selectedUserId} />
        </Form.Item>

        {/* Ghi chú hiển thị bên dưới */}
        <div style={{ padding: 12, background: selectedUserId ? "#e6f7ff" : "#f0f2f5", borderRadius: 4 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
            💡 <strong>Lưu ý:</strong>{" "}
            {selectedUserId
              ? "Bạn đang thêm người dùng có sẵn vào phòng. Họ sẽ có thể xem hóa đơn hàng tháng của phòng này."
              : "Hệ thống sẽ tạo tài khoản mới cho người ở cùng. Họ có thể đăng nhập bằng email và mật khẩu để xem hóa đơn hàng tháng. Chỉ người thuê chính mới có thể thanh toán."}
          </p>
        </div>
      </Form>
    </Modal>
  );
};

export default AddCoTenantModal;
