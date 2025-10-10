import React, { useEffect, useState } from "react";
import { Table, Card, Typography, Button } from "antd";
import axios from "axios";

const { Title } = Typography;

interface Contract {
  id: number;
  roomName: string;
  startDate: string;
  endDate: string;
  price: number;
  status: string;
}

const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    axios.get("http://localhost:3000/contracts").then((res) => {
      setContracts(res.data);
    });
  }, []);

  const columns = [
    { title: "Phòng", dataIndex: "roomName", key: "roomName" },
    { title: "Ngày bắt đầu", dataIndex: "startDate", key: "startDate" },
    { title: "Ngày kết thúc", dataIndex: "endDate", key: "endDate" },
    { title: "Giá thuê", dataIndex: "price", key: "price", render: (p: number) => `${p.toLocaleString()} VNĐ` },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Title level={2}>📜 Danh sách hợp đồng</Title>
      <Card>
        <Table
          dataSource={contracts}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default Contracts;
