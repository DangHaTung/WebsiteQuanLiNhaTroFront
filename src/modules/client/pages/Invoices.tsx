import React, { useEffect, useState } from "react";
import { Table, Tag, Card } from "antd";
import axios from "axios";

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000/invoices")
      .then((res) => setInvoices(res.data))
      .catch((err) => console.error("Lỗi tải hóa đơn:", err))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      title: "Mã hóa đơn",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên phòng",
      dataIndex: "roomName",
      key: "roomName",
    },
    {
      title: "Tháng",
      dataIndex: "month",
      key: "month",
      render: (month: string) =>
        month ? month.replace("-", "/") : "Không xác định",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) =>
        typeof amount === "number"
          ? amount.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })
          : "0 ₫",
    },
    {
      title: "Ngày thanh toán",
      dataIndex: "paidDate",
      key: "paidDate",
      render: (date: string | null) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "—",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Đã thanh toán" ? "green" : "volcano"}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 20px" }}>
      <Card title="🧾 Danh sách Hóa đơn thanh toán">
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default Invoices;
