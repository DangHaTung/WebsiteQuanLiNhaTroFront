import React, { useEffect, useState } from "react";
import { Modal, Table, Button, Space, Tag, message, Select, Input, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { utilService, UTILITY_TYPE_LABELS, UTILITY_CONDITION_LABELS, UTILITY_CONDITION_COLORS, type Util, type UtilityType, type UtilityCondition } from "../services/util";
import type { Room } from "../../../types/room";

const { Option } = Select;

interface RoomUtilitiesModalProps {
  visible: boolean;
  room: Room | null;
  onClose: () => void;
}
// Main component for managing room utilities
const RoomUtilitiesModal: React.FC<RoomUtilitiesModalProps> = ({ visible, room, onClose }) => {
  const [utilities, setUtilities] = useState<Util[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  
  // Add new utility form
  const [newUtilType, setNewUtilType] = useState<UtilityType | undefined>();
  const [newUtilCondition, setNewUtilCondition] = useState<UtilityCondition>("used");
  const [newUtilDescription, setNewUtilDescription] = useState("");

  useEffect(() => {
    if (visible && room) {
      loadUtilities();
    }
  }, [visible, room]);
// Load utilities for the selected room
  const loadUtilities = async () => {
    if (!room) return;
    // Fetch utilities from the API
    try {
      setLoading(true);
      const data = await utilService.getByRoom(room._id!);
      setUtilities(data);
      // Handle case when no utilities are found
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi tải đồ đạc");
    } finally {
      setLoading(false);
    }
  };
// Handle adding a new utility to the room
  const handleAdd = async () => {
    if (!room || !newUtilType) {
      message.warning("Vui lòng chọn loại đồ đạc");
      return;
    }
// Call API to create new utility
    try {
      setAdding(true);
      
      const payload: any = {
        name: newUtilType,
        condition: newUtilCondition,
        room: room._id,
      };
    
      // Chỉ thêm description nếu có giá trị
      if (newUtilDescription && newUtilDescription.trim()) {
        payload.description = newUtilDescription.trim();
      }
      
      await utilService.create(payload);
      // Refresh the utilities list
      message.success("Thêm đồ đạc thành công!");
      setNewUtilType(undefined);
      setNewUtilCondition("used");
      setNewUtilDescription("");
      loadUtilities();
      // Handle API errors
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi thêm đồ đạc");
    } finally {
      setAdding(false);
    }
  };
// Handle updating the condition of a utility
  const handleUpdateCondition = async (id: string, condition: UtilityCondition) => {
    try {
      await utilService.updateCondition(id, condition);
      message.success("Cập nhật trạng thái thành công!");
      loadUtilities();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi cập nhật");
    }
  };
// Handle deleting a utility from the room
  const handleDelete = async (id: string) => {
    try {
      await utilService.delete(id);
      message.success("Xóa đồ đạc thành công!");
      loadUtilities();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi xóa");
    }
  };
// Define table columns for displaying utilities
  const columns = [
    {
      title: "Tên đồ đạc",
      dataIndex: "name",
      key: "name",
      render: (name: UtilityType) => UTILITY_TYPE_LABELS[name] || name,
    },
    {
      title: "Tình trạng",
      dataIndex: "condition",
      key: "condition",
      render: (condition: UtilityCondition, record: Util) => (
        <Select
          value={condition}
          onChange={(value) => handleUpdateCondition(record._id, value)}
          style={{ width: 120 }}
        >
          {Object.entries(UTILITY_CONDITION_LABELS).map(([key, label]) => (
            <Option key={key} value={key}>
              <Tag color={UTILITY_CONDITION_COLORS[key as UtilityCondition]}>{label}</Tag>
            </Option>
          ))}
        </Select>
      ),
    },
    // Ghi chú column
    {
      title: "Ghi chú",
      dataIndex: "description",
      key: "description",
      render: (text: string) => text || "-",
    },
    // Action column for deleting utilities
    {
      title: "Hành động",
      key: "action",
      width: 100,
      render: (_: any, record: Util) => (
        <Popconfirm
          title="Xóa đồ đạc này?"
          onConfirm={() => handleDelete(record._id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];
// Render the modal with utilities management UI
  return (
    <Modal
      title={`Quản lý đồ đạc - Phòng ${room?.roomNumber || ""}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {/* Add new utility */}
      <Space style={{ marginBottom: 16, width: "100%" }} direction="vertical">
        <Space.Compact style={{ width: "100%" }}>
          <Select
            placeholder="Chọn đồ đạc"
            value={newUtilType}
            onChange={setNewUtilType}
            style={{ width: "30%" }}
          >
            {Object.entries(UTILITY_TYPE_LABELS).map(([key, label]) => (
              <Option key={key} value={key}>
                {label}
              </Option>
            ))}
          </Select>
          
          <Select
            value={newUtilCondition}
            onChange={setNewUtilCondition}
            style={{ width: "20%" }}
          >
            {Object.entries(UTILITY_CONDITION_LABELS).map(([key, label]) => (
              <Option key={key} value={key}>
                {label}
              </Option>
            ))}
          </Select>

          <Input
            placeholder="Ghi chú (tùy chọn)"
            value={newUtilDescription}
            onChange={(e) => setNewUtilDescription(e.target.value)}
            style={{ width: "35%" }}
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            loading={adding}
            style={{ width: "15%" }}
          >
            Thêm
          </Button>
        </Space.Compact>
      </Space>

      {/* Utilities table */}
      <Table
        columns={columns}
        dataSource={utilities}
        rowKey="_id"
        loading={loading}
        pagination={false}
        size="small"
      />
    </Modal>
  );
};

export default RoomUtilitiesModal;
