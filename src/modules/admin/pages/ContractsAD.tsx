import React, { useState, useEffect } from "react";
import { Table, Card, Tag, Button, Space, message, Modal, Descriptions } from "antd";
import { UserAddOutlined, EyeOutlined, TeamOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import AddCoTenantModal from "../components/AddCoTenantModal";

interface CoTenant {
  userId?: string;
  fullName: string;
  phone: string;
  email?: string;
  joinedAt: string;
  status?: "ACTIVE" | "EXPIRED"; // Trạng thái: ACTIVE = đang hoạt động, EXPIRED = hết hiệu lực
}

interface Contract {
  _id: string;
  tenantId?: string | {
    _id: string;
    fullName: string;
    phone: string;
    email: string;
  };
  tenantSnapshot?: {
    fullName?: string;
    phone?: string;
    email?: string;
    identityNo?: string;
    note?: string;
  };
  roomId?: string | {
    _id: string;
    roomNumber: string;
    pricePerMonth: number;
  };
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  status: "ACTIVE" | "ENDED" | "CANCELED";
  canceledAt?: string; // Ngày hủy hợp đồng (nếu hủy trước hạn)
  coTenants?: CoTenant[];
  createdAt: string;
}

const ContractsAD: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [addCoTenantVisible, setAddCoTenantVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      
      // Import service
      const { adminContractService } = await import("../services/contract");
      
      console.log("🔍 Loading contracts...");
      // Lấy tất cả hợp đồng (ACTIVE, ENDED, CANCELED) - không filter theo status
      // Backend sẽ tự động loại bỏ contracts có room AVAILABLE nhưng contract ACTIVE (không nhất quán)
      const data = await adminContractService.getAll({ limit: 100 });
      
      console.log("✅ Loaded contracts:", data.length);
      setContracts(data);
    } catch (error: any) {
      console.error("❌ Error loading contracts:", error);
      message.error(error?.response?.data?.message || error.message || "Lỗi khi tải danh sách hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoTenant = (contract: Contract) => {
    setSelectedContract(contract);
    setAddCoTenantVisible(true);
  };

  const handleViewDetail = (contract: Contract) => {
    const roomNumber = typeof contract.roomId === "object" && contract.roomId?.roomNumber 
      ? contract.roomId.roomNumber 
      : "N/A";
    
    Modal.info({
      title: `Chi tiết hợp đồng - Phòng ${roomNumber}`,
      width: 700,
      content: (
        <div style={{ marginTop: 16 }}>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Người thuê chính">
              {typeof contract.tenantId === "object" && contract.tenantId?.fullName 
                ? contract.tenantId.fullName 
                : contract.tenantSnapshot?.fullName || "N/A"}
              <br />
              <small style={{ color: "#666" }}>
                {typeof contract.tenantId === "object" && contract.tenantId?.phone ? contract.tenantId.phone : (contract.tenantSnapshot?.phone || "N/A")}
                {((typeof contract.tenantId === "object" && contract.tenantId?.email) || contract.tenantSnapshot?.email) && 
                  ` | ${(typeof contract.tenantId === "object" && contract.tenantId?.email) || contract.tenantSnapshot?.email}`}
              </small>
            </Descriptions.Item>
            <Descriptions.Item label="Phòng">
              {typeof contract.roomId === "object" && contract.roomId?.roomNumber 
                ? `${contract.roomId.roomNumber} - ${(contract.roomId.pricePerMonth || 0).toLocaleString("vi-VN")} đ/tháng`
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Thời hạn">
              {dayjs(contract.startDate).format("DD/MM/YYYY")} - {dayjs(contract.endDate).format("DD/MM/YYYY")}
              {contract.status === "CANCELED" && contract.canceledAt && (
                <div style={{ marginTop: 4 }}>
                  <small style={{ color: "#ff4d4f", fontWeight: 500 }}>
                    Hủy ngày: {dayjs(contract.canceledAt).format("DD/MM/YYYY HH:mm")}
                  </small>
                </div>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Tiền cọc">
              {contract.deposit.toLocaleString("vi-VN")} đ
            </Descriptions.Item>
            <Descriptions.Item label="Tiền phòng/tháng">
              {contract.monthlyRent.toLocaleString("vi-VN")} đ
            </Descriptions.Item>
            <Descriptions.Item label="Người ở cùng">
              {contract.coTenants && contract.coTenants.length > 0 ? (
                <div>
                  {contract.coTenants
                    .filter(ct => ct.status === "ACTIVE") // Chỉ hiển thị những người đang hoạt động
                    .map((ct, idx) => (
                      <div key={idx} style={{ marginBottom: 8 }}>
                        <strong>{ct.fullName}</strong>
                        <br />
                        <small style={{ color: "#666" }}>
                          {ct.phone} {ct.email && `| ${ct.email}`}
                          <br />
                          Tham gia: {dayjs(ct.joinedAt).format("DD/MM/YYYY")}
                        </small>
                      </div>
                    ))}
                  {contract.coTenants.filter(ct => ct.status === "EXPIRED").length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #eee" }}>
                      <small style={{ color: "#999" }}>
                        Hết hiệu lực: {contract.coTenants.filter(ct => ct.status === "EXPIRED").length} người
                      </small>
                    </div>
                  )}
                </div>
              ) : (
                <span style={{ color: "#999" }}>Chưa có</span>
              )}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    });
  };

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      ACTIVE: { color: "success", text: "Đang hoạt động" },
      ENDED: { color: "default", text: "Hết hiệu lực" },
      CANCELED: { color: "error", text: "Hết hiệu lực" },
    };
    const m = map[status] || { color: "default", text: status };
    return <Tag color={m.color}>{m.text}</Tag>;
  };

  const columns = [
    {
      title: "Phòng",
      dataIndex: ["roomId", "roomNumber"],
      key: "room",
      render: (roomNumber: string) => <strong>{roomNumber}</strong>,
    },
    {
      title: "Người thuê chính",
      key: "tenant",
      render: (_: any, record: Contract) => {
        // Lấy tên từ tenantId (nếu được populate) hoặc tenantSnapshot
        const tenantId = typeof record.tenantId === "object" ? record.tenantId : null;
        const tenantName = tenantId?.fullName || record.tenantSnapshot?.fullName || "N/A";
        const tenantPhone = tenantId?.phone || record.tenantSnapshot?.phone;
        
        return (
          <div>
            <div>{tenantName}</div>
            {tenantPhone && (
              <small style={{ color: "#666" }}>{tenantPhone}</small>
            )}
          </div>
        );
      },
    },
    {
      title: "Người ở cùng",
      dataIndex: "coTenants",
      key: "coTenants",
      render: (coTenants: CoTenant[]) => {
        // Chỉ tính những người đang hoạt động (status = ACTIVE)
        const activeCoTenants = coTenants?.filter(ct => ct.status === "ACTIVE") || [];
        return (
          <div>
            {activeCoTenants.length > 0 ? (
              <Tag icon={<TeamOutlined />} color="blue">
                {activeCoTenants.length} người
              </Tag>
            ) : (
              <span style={{ color: "#999" }}>Chưa có</span>
            )}
          </div>
        );
      },
    },
    {
      title: "Thời hạn",
      key: "duration",
      render: (_: any, record: Contract) => (
        <div>
          <div>{dayjs(record.startDate).format("DD/MM/YYYY")}</div>
          <small style={{ color: "#666" }}>đến {dayjs(record.endDate).format("DD/MM/YYYY")}</small>
          {record.status === "CANCELED" && record.canceledAt && (
            <div style={{ marginTop: 4 }}>
              <small style={{ color: "#ff4d4f", fontWeight: 500 }}>
                Hủy: {dayjs(record.canceledAt).format("DD/MM/YYYY")}
              </small>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Tiền phòng",
      dataIndex: "monthlyRent",
      key: "rent",
      align: "right" as const,
      render: (rent: number) => <strong>{rent.toLocaleString("vi-VN")} đ</strong>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: Contract) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            Chi tiết
          </Button>
          {record.status === "ACTIVE" && (
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => handleAddCoTenant(record)}
              size="small"
            >
              Thêm người ở cùng
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Quản lý người ở cùng</h2>
          <p style={{ color: "#666", marginTop: 8 }}>
            Danh sách tất cả hợp đồng. Bạn có thể thêm người ở cùng phòng cho các hợp đồng đang hoạt động.
          </p>
        </div>

        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: "Chưa có hợp đồng nào",
          }}
        />
      </Card>

      {selectedContract && (
        <AddCoTenantModal
          visible={addCoTenantVisible}
          onCancel={() => {
            setAddCoTenantVisible(false);
            setSelectedContract(null);
          }}
          onSuccess={() => {
            setAddCoTenantVisible(false);
            setSelectedContract(null);
            loadContracts();
          }}
          contractId={selectedContract._id}
          roomNumber={
            typeof selectedContract.roomId === "object" && selectedContract.roomId?.roomNumber
              ? selectedContract.roomId.roomNumber
              : "N/A"
          }
        />
      )}
    </div>
  );
};

export default ContractsAD;
