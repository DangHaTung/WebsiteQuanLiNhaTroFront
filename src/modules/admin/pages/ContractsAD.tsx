import React, { useState, useEffect } from "react";
import { Table, Card, Tag, Button, Space, message, Modal, Descriptions, Popconfirm, Divider } from "antd";
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
  depositRefunded?: boolean;
  depositRefund?: {
    refundedAt?: string;
  };
  coTenants?: CoTenant[];
  createdAt: string;
}

const ContractsAD: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [addCoTenantVisible, setAddCoTenantVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailContract, setDetailContract] = useState<Contract | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const handleViewDetail = async (contract: Contract) => {
    try {
      setDetailVisible(true);
      setDetailLoading(true);
      const { adminContractService } = await import("../services/contract");
      const fresh = await adminContractService.getById(contract._id);
      setDetailContract(fresh);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi tải chi tiết hợp đồng");
      setDetailVisible(false);
      setDetailContract(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRemoveCoTenant = async (contractId: string, userId: string) => {
    try {
      const { adminContractService } = await import("../services/contract");
      await adminContractService.removeCoTenant(contractId, userId);
      message.success("Đã gỡ người ở cùng khỏi phòng");
      // Reload detail + list
      const fresh = await adminContractService.getById(contractId);
      setDetailContract(fresh);
      await loadContracts();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Lỗi khi gỡ người ở cùng");
    }
  };

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      ACTIVE: { color: "success", text: "Đang hoạt động" },
      // ✅ UX: "Hết hiệu lực" hiển thị đồng bộ màu đỏ
      ENDED: { color: "error", text: "Hết hiệu lực" },
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
      render: (_: any, record: Contract) => {
        const inactiveAt = record.canceledAt || record.depositRefund?.refundedAt;
        return (
          <div>
            <div>{dayjs(record.startDate).format("DD/MM/YYYY")}</div>
            <small style={{ color: "#666" }}>đến {dayjs(record.endDate).format("DD/MM/YYYY")}</small>
            {record.status !== "ACTIVE" && inactiveAt && (
              <div style={{ marginTop: 4 }}>
                <small style={{ color: "#ff4d4f", fontWeight: 500 }}>
                  {record.status === "CANCELED" ? "Hủy" : "Hết hiệu lực"}: {dayjs(inactiveAt).format("DD/MM/YYYY")}
                </small>
              </div>
            )}
          </div>
        );
      },
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

      {/* Modal chi tiết hợp đồng (có thể gỡ co-tenant) */}
      <Modal
        open={detailVisible}
        title={
          detailContract && typeof detailContract.roomId === "object"
            ? `Chi tiết hợp đồng - Phòng ${detailContract.roomId.roomNumber}`
            : "Chi tiết hợp đồng"
        }
        width={760}
        onCancel={() => {
          setDetailVisible(false);
          setDetailContract(null);
        }}
        footer={null}
        confirmLoading={detailLoading}
      >
        {detailContract && (
          <div style={{ marginTop: 8 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Người thuê chính">
                {typeof detailContract.tenantId === "object" && detailContract.tenantId?.fullName
                  ? detailContract.tenantId.fullName
                  : detailContract.tenantSnapshot?.fullName || "N/A"}
                <br />
                <small style={{ color: "#666" }}>
                  {typeof detailContract.tenantId === "object" && detailContract.tenantId?.phone
                    ? detailContract.tenantId.phone
                    : (detailContract.tenantSnapshot?.phone || "N/A")}
                  {((typeof detailContract.tenantId === "object" && detailContract.tenantId?.email) || detailContract.tenantSnapshot?.email) &&
                    ` | ${(typeof detailContract.tenantId === "object" && detailContract.tenantId?.email) || detailContract.tenantSnapshot?.email}`}
                </small>
              </Descriptions.Item>

              <Descriptions.Item label="Phòng">
                {typeof detailContract.roomId === "object" && detailContract.roomId?.roomNumber
                  ? `${detailContract.roomId.roomNumber} - ${(detailContract.roomId.pricePerMonth || 0).toLocaleString("vi-VN")} đ/tháng`
                  : "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Thời hạn">
                {dayjs(detailContract.startDate).format("DD/MM/YYYY")} - {dayjs(detailContract.endDate).format("DD/MM/YYYY")}
              </Descriptions.Item>

              <Descriptions.Item label="Người ở cùng">
                {detailContract.coTenants && detailContract.coTenants.length > 0 ? (
                  <div>
                    {detailContract.coTenants
                      .filter(ct => ct.status === "ACTIVE")
                      .map((ct, idx) => (
                        <div key={idx} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                            <div>
                              <strong>{ct.fullName}</strong>
                              <div style={{ color: "#666", fontSize: 12 }}>
                                {ct.phone} {ct.email && `| ${ct.email}`}
                                <br />
                                Tham gia: {dayjs(ct.joinedAt).format("DD/MM/YYYY")}
                              </div>
                            </div>
                            {ct.userId && (
                              <Popconfirm
                                title="Gỡ người này khỏi phòng?"
                                okText="Gỡ"
                                cancelText="Không"
                                onConfirm={() => handleRemoveCoTenant(detailContract._id, ct.userId!)}
                              >
                                <Button danger size="small">
                                  Gỡ
                                </Button>
                              </Popconfirm>
                            )}
                          </div>
                          <Divider style={{ margin: "10px 0" }} />
                        </div>
                      ))}
                    {detailContract.coTenants.filter(ct => ct.status === "EXPIRED").length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <small style={{ color: "#999" }}>
                          Hết hiệu lực: {detailContract.coTenants.filter(ct => ct.status === "EXPIRED").length} người
                        </small>
                      </div>
                    )}
                    {detailContract.coTenants.filter(ct => ct.status === "ACTIVE").length === 0 && (
                      <span style={{ color: "#999" }}>Chưa có</span>
                    )}
                  </div>
                ) : (
                  <span style={{ color: "#999" }}>Chưa có</span>
                )}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

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
          roomNumber={selectedContract.roomId.roomNumber}
        />
      )}
    </div>
  );
};

export default ContractsAD;
