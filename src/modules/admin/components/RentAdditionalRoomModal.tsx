import { Modal, Form, Select, DatePicker, InputNumber, message } from "antd";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { adminFinalContractService } from "../services/finalContract";
import api from "../services/api";

interface RentAdditionalRoomModalProps {
  visible: boolean;
  tenantId: string | null;
  tenantName: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const RentAdditionalRoomModal: React.FC<RentAdditionalRoomModalProps> = ({
  visible,
  tenantId,
  tenantName,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [existingContract, setExistingContract] = useState<any>(null);

  useEffect(() => {
    if (visible && tenantId) {
      loadAvailableRooms();
      loadExistingContract();
    }
  }, [visible, tenantId]);

  const loadExistingContract = async () => {
    try {
      // Lấy hợp đồng chính thức (FinalContract) để lấy thời gian
      const finalContractResponse = await api.get("/final-contracts", { 
        params: { tenantId, status: "SIGNED" } 
      });
      const finalContracts = finalContractResponse.data.data || [];
      
      if (finalContracts.length > 0) {
        const firstFinalContract = finalContracts[0];
        setExistingContract(firstFinalContract);
        
        // Auto-fill thời gian giống hợp đồng đầu tiên
        form.setFieldsValue({
          startDate: dayjs(firstFinalContract.startDate),
          endDate: dayjs(firstFinalContract.endDate),
        });
      }
    } catch (error) {
      console.error("Load existing contract error:", error);
    }
  };

  const loadAvailableRooms = async () => {
    try {
      const response = await api.get("/rooms", { params: { status: "AVAILABLE" } });
      setRooms(response.data.data || []);
    } catch (error) {
      console.error("Load rooms error:", error);
      message.error("Lỗi khi tải danh sách phòng trống");
    }
  };

  const handleRoomChange = (roomId: string) => {
    const room = rooms.find((r) => r._id === roomId);
    setSelectedRoom(room);
    if (room) {
      form.setFieldsValue({ depositAmount: room.pricePerMonth });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!tenantId) {
        message.error("Không tìm thấy thông tin tenant");
        return;
      }

      setLoading(true);
      await adminFinalContractService.rentAdditionalRoom({
        tenantId,
        roomId: values.roomId,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        depositAmount: values.depositAmount,
      });

      message.success("Tạo hợp đồng thuê thêm phòng thành công!");
      form.resetFields();
      setSelectedRoom(null);
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi tạo hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedRoom(null);
    onClose();
  };

  return (
    <Modal
      title="🏠 Thuê thêm phòng"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Tạo hợp đồng"
      cancelText="Hủy"
      width={600}
    >
      <div style={{ marginBottom: 16, padding: 12, background: "#f0f2f5", borderRadius: 8 }}>
        <strong>Khách hàng:</strong> {tenantName}
        {existingContract && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            Thời gian hợp đồng hiện tại: {dayjs(existingContract.startDate).format("DD/MM/YYYY")} → {dayjs(existingContract.endDate).format("DD/MM/YYYY")}
          </div>
        )}
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          label="Chọn phòng"
          name="roomId"
          rules={[{ required: true, message: "Vui lòng chọn phòng" }]}
        >
          <Select
            placeholder="Chọn phòng trống"
            onChange={handleRoomChange}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={rooms.map((room) => ({
              value: room._id,
              label: `${room.roomNumber} - ${room.pricePerMonth?.toLocaleString("vi-VN")} VNĐ/tháng`,
            }))}
          />
        </Form.Item>

        {selectedRoom && (
          <div style={{ marginBottom: 16, padding: 12, background: "#e6f7ff", borderRadius: 8 }}>
            <div><strong>Phòng:</strong> {selectedRoom.roomNumber}</div>
            <div><strong>Giá thuê:</strong> {selectedRoom.pricePerMonth?.toLocaleString("vi-VN")} VNĐ/tháng</div>
            <div><strong>Loại:</strong> {selectedRoom.type || "N/A"}</div>
          </div>
        )}

        <Form.Item
          label="Ngày bắt đầu"
          name="startDate"
          rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          tooltip="Tự động điền theo hợp đồng hiện tại"
        >
          <DatePicker
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày bắt đầu"
          />
        </Form.Item>

        <Form.Item
          label="Ngày kết thúc"
          name="endDate"
          rules={[
            { required: true, message: "Vui lòng chọn ngày kết thúc" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || !getFieldValue("startDate")) {
                  return Promise.resolve();
                }
                if (value.isAfter(getFieldValue("startDate"))) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Ngày kết thúc phải sau ngày bắt đầu"));
              },
            }),
          ]}
          tooltip="Tự động điền theo hợp đồng hiện tại"
        >
          <DatePicker
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày kết thúc"
          />
        </Form.Item>

        <Form.Item
          label="Tiền cọc"
          name="depositAmount"
          rules={[{ required: true, message: "Vui lòng nhập tiền cọc" }]}
          tooltip="Mặc định = 1 tháng tiền phòng"
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(value) => {
              const parsed = Number(value?.replace(/\$\s?|(,*)/g, "") || 0);
              return parsed as any;
            }}
            addonAfter="VNĐ"
          />
        </Form.Item>
      </Form>

      <div style={{ marginTop: 16, padding: 12, background: "#fff7e6", borderRadius: 8, fontSize: 12 }}>
        <strong>Lưu ý:</strong>
        <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
          <li>Hợp đồng sẽ được tạo ngay cho khách hàng hiện tại</li>
          <li>Không cần phiếu thu cọc giữ phòng</li>
          <li>Hóa đơn bao gồm: Tiền thuê tháng đầu + Tiền cọc</li>
        </ul>
      </div>
    </Modal>
  );
};

export default RentAdditionalRoomModal;
