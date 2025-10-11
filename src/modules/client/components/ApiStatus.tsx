import React from "react";
import { Alert, Spin } from "antd";
import { CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useApiTest } from "../hooks/useApiTest";

const ApiStatus: React.FC = () => {
  const { isConnected, loading, error } = useApiTest();

  if (loading) {
    return (
      <Alert
        message="Đang kiểm tra kết nối API..."
        icon={<Spin size="small" />}
        type="info"
        style={{ margin: "10px 0" }}
      />
    );
  }

  if (isConnected) {
    return (
      <Alert
        message="Kết nối API thành công"
        icon={<CheckCircleOutlined />}
        type="success"
        style={{ margin: "10px 0" }}
      />
    );
  }

  return (
    <Alert
      message="Lỗi kết nối API"
      description={error || "Không thể kết nối đến backend server"}
      icon={<ExclamationCircleOutlined />}
      type="error"
      style={{ margin: "10px 0" }}
      action={
        <button
          onClick={() => window.location.reload()}
          style={{
            background: "none",
            border: "1px solid #ff4d4f",
            color: "#ff4d4f",
            padding: "4px 8px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Thử lại
        </button>
      }
    />
  );
};

export default ApiStatus;
