import { Modal, Form, InputNumber, message, Descriptions, Alert } from "antd";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { adminFinalContractService } from "../services/finalContract";

interface ExtendContractModalProps {
  visible: boolean;
  contract: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ExtendContractModal: React.FC<ExtendContractModalProps> = ({
  visible,
  contract,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [extensionMonths, setExtensionMonths] = useState<number>(6);
  const [newEndDate, setNewEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (contract && extensionMonths) {
      const currentEndDate = new Date(contract.endDate);
      const calculated = new Date(currentEndDate);
      calculated.setMonth(calculated.getMonth() + extensionMonths);
      setNewEndDate(calculated);
    }
  }, [contract, extensionMonths]);

  const handleExtend = async () => {
    try {
      setLoading(true);
      await adminFinalContractService.extend(contract._id, extensionMonths);
      message.success(`Gia hạn hợp đồng thành công thêm ${extensionMonths} tháng`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi gia hạn hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setExtensionMonths(6);
    onClose();
  };

  if (!contract) return null;

  const daysUntilExpiry = Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = daysUntilExpiry < 0;
  const isExpiringSoon = daysUntilExpiry < 30 && daysUntilExpiry >= 0;

  return (
    <Modal
      title="🔄 Gia hạn hợp đồng"
      open={visible}
      onOk={handleExtend}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Xác nhận gia hạn"
      cancelText="Hủy"
      width={600}
    >
      <Alert
        message={
          isExpired
            ? "⚠️ Hợp đồng đã hết hạn"
            : isExpiringSoon
            ? "⏰ Hợp đồng sắp hết hạn"
            : "✅ Hợp đồng đang hoạt động"
        }
        description={`Còn ${daysUntilExpiry} ngày (${Math.abs(daysUntilExpiry)} ngày ${isExpired ? "quá hạn" : ""})`}
        type={isExpired ? "error" : isExpiringSoon ? "warning" : "info"}
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Phòng">
          {contract.roomId?.roomNumber || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Người thuê">
          {contract.tenantId?.fullName || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày bắt đầu">
          {dayjs(contract.startDate).format("DD/MM/YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày kết thúc hiện tại">
          <span style={{ color: isExpired ? "red" : isExpiringSoon ? "orange" : "inherit" }}>
            {dayjs(contract.endDate).format("DD/MM/YYYY")}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Số lần gia hạn">
          {contract.metadata?.extensions?.length || 0} lần
        </Descriptions.Item>
      </Descriptions>

      <Form form={form} layout="vertical" initialValues={{ extensionMonths: 6 }}>
        <Form.Item
          label="Số tháng gia hạn"
          name="extensionMonths"
          rules={[{ required: true, message: "Vui lòng chọn số tháng gia hạn" }]}
        >
          <InputNumber
            min={1}
            max={60}
            value={extensionMonths}
            onChange={(value) => setExtensionMonths(value || 6)}
            addonAfter="tháng"
            style={{ width: "100%" }}
            placeholder="Nhập số tháng (6, 12, 24...)"
          />
        </Form.Item>

        {newEndDate && (
          <Alert
            message="Ngày kết thúc mới"
            description={
              <div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#52c41a" }}>
                  {dayjs(newEndDate).format("DD/MM/YYYY")}
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                  Hợp đồng sẽ được gia hạn từ{" "}
                  <strong>{dayjs(contract.endDate).format("DD/MM/YYYY")}</strong> đến{" "}
                  <strong>{dayjs(newEndDate).format("DD/MM/YYYY")}</strong>
                </div>
              </div>
            }
            type="success"
            showIcon
          />
        )}
      </Form>

      {contract.metadata?.extensions && contract.metadata.extensions.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>📜 Lịch sử gia hạn:</div>
          <div style={{ maxHeight: 150, overflowY: "auto", fontSize: 12 }}>
            {contract.metadata.extensions.map((ext: any, idx: number) => (
              <div key={idx} style={{ padding: "4px 0", borderBottom: "1px solid #f0f0f0" }}>
                <strong>Lần {idx + 1}:</strong> {dayjs(ext.extendedAt).format("DD/MM/YYYY HH:mm")} - Gia hạn{" "}
                {ext.extensionMonths} tháng
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ExtendContractModal;
