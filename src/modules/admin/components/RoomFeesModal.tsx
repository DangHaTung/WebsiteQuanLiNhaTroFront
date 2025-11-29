import React, { useEffect, useState } from "react";
import { Modal, Checkbox, message, Space, Typography, Divider, Spin, Alert } from "antd";
import { roomFeeService } from "../services/roomFee";
import type { Room } from "../../../types/room";

const { Text } = Typography;
// Props for RoomFeesModal component
interface RoomFeesModalProps {
  visible: boolean;
  room: Room | null;
  onClose: () => void;
  onSuccess: () => void;
}// Main component for configuring room fees and utilities

const RoomFeesModal: React.FC<RoomFeesModalProps> = ({ visible, room, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  useEffect(() => {
    if (visible && room) {
      loadRoomFees();
    }
  }, [visible, room]);
// Load existing room fee configurations
  const loadRoomFees = async () => {
    if (!room) return;
    
    try {
      setLoading(true);
      const data = await roomFeeService.getRoomFees(room._id!);
      setSelectedTypes(data.appliedTypes || []);
    } catch (error: any) {
      // Nếu chưa có config, để mặc định
      if (error?.response?.status === 404) {
        setSelectedTypes(["electricity", "water"]); // Default
      } else {
        console.error("Error loading room fees:", error);
      }
    } finally {
      setLoading(false);
    }
  };
// Handle saving the selected room fees
  const handleSave = async () => {
    if (!room) return;

    try {
      setSaving(true);
      await roomFeeService.assignFees(room._id!, selectedTypes);
      message.success("Cấu hình tiện ích thành công!");
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi cấu hình tiện ích");
    } finally {
      setSaving(false);
    }
  };
// Handle checkbox changes for fee types
  const handleCheckboxChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type]);
    } else {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    }
  };
// Render the modal for room fee configuration
  return (
    <Modal
      title={`Cấu hình tiện ích - ${room?.roomNumber || ""}`}
      open={visible}
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={saving}
      okText="Lưu cấu hình"
      cancelText="Hủy"
      width={500}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : (
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Alert
            message="Cấu hình tiện ích phòng"
            description="Chọn các tiện ích và phí dịch vụ áp dụng cho phòng này. Các phí được chọn sẽ tự động tính vào hóa đơn hàng tháng."
            type="info"
            showIcon
          />

          <Divider />

          <Space direction="vertical" style={{ width: "100%" }}>
            <Text strong style={{ marginBottom: 8, display: "block" }}>Tiện ích phòng:</Text>
            
            <Checkbox
              checked={selectedTypes.includes("electricity")}
              onChange={(e) => handleCheckboxChange("electricity", e.target.checked)}
            >
              <Space>
                <Text strong>⚡ Tiền điện</Text>
                <Text type="secondary">(Bắt buộc - Tính theo bậc thang)</Text>
              </Space>
            </Checkbox>

            <Checkbox
              checked={selectedTypes.includes("water")}
              onChange={(e) => handleCheckboxChange("water", e.target.checked)}
            >
              <Space>
                <Text strong>💧 Tiền nước</Text>
                <Text type="secondary">(Phí cố định hàng tháng)</Text>
              </Space>
            </Checkbox>

            <Checkbox
              checked={selectedTypes.includes("internet")}
              onChange={(e) => handleCheckboxChange("internet", e.target.checked)}
            >
              <Space>
                <Text strong>📡 Internet</Text>
                <Text type="secondary">(Phí cố định hàng tháng)</Text>
              </Space>
            </Checkbox>

            <Checkbox
              checked={selectedTypes.includes("cleaning")}
              onChange={(e) => handleCheckboxChange("cleaning", e.target.checked)}
            >
              <Space>
                <Text strong>🧹 Phí dọn dẹp</Text>
                <Text type="secondary">(Phí cố định hàng tháng)</Text>
              </Space>
            </Checkbox>

            <Checkbox
              checked={selectedTypes.includes("parking")}
              onChange={(e) => handleCheckboxChange("parking", e.target.checked)}
            >
              <Space>
                <Text strong>🚗 Phí đỗ xe</Text>
                <Text type="secondary">(Phí cố định hàng tháng)</Text>
              </Space>
            </Checkbox>
          </Space>

          <Divider />

          <Text type="secondary" style={{ fontSize: 12 }}>
            * Cấu hình này áp dụng cho tất cả hợp đồng của phòng này.
          </Text>
        </Space>
      )}
    </Modal>
  );
};

export default RoomFeesModal;
