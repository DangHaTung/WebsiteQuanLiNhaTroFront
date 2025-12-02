import React, { useEffect, useMemo, useState } from "react";
import { Table, Tag, Typography, message, Row, Col, Statistic } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Bill, BillStatus, BillType } from "../../../types/bill";
import type { Tenant } from "../../../types/tenant";
import type { Room } from "../../../types/room";
import dayjs from "dayjs";
import { adminBillService } from "../services/bill";
import { adminTenantService } from "../services/tenant";
import { adminRoomService } from "../services/room";
import BillDetailDrawer from "../components/BillDetailDrawer";
import "../../../assets/styles/roomAd.css";
import { useSearchParams } from "react-router-dom";

const { Title } = Typography;

interface Contract {
  _id: string;
  tenantId?: { fullName?: string } | string;
  roomId?: { roomNumber?: string } | string;
}

const BillsAD: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [contracts] = useState<Contract[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<BillStatus | "ALL">("ALL");
  const [billTypeFilter, setBillTypeFilter] = useState<BillType | "ALL">("ALL");

  // Drawer detail
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | undefined>(
    undefined
  );

  // State để theo dõi đã load các dữ liệu phụ chưa
  const [hasLoadedTenants, setHasLoadedTenants] = useState<boolean>(false);
  const [hasLoadedRooms, setHasLoadedRooms] = useState<boolean>(false);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    loadBills();
  }, [statusFilter, billTypeFilter]);

  // Tự động mở drawer khi có billId trong URL
  useEffect(() => {
    const billId = searchParams.get("billId");
    if (billId && bills.length > 0) {
      setSelectedBillId(billId);
      setDetailVisible(true);
      // Xóa billId khỏi URL sau khi đã mở drawer
      searchParams.delete("billId");
      setSearchParams(searchParams);
    }
  }, [searchParams, bills]);

  // Load bills với filter
  const loadBills = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (statusFilter && statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      if (billTypeFilter && billTypeFilter !== "ALL") {
        params.billType = billTypeFilter;
      }
      const billsData = await adminBillService.getAll(params);
      setBills(billsData);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "Lỗi khi tải dữ liệu hóa đơn"
      );
    } finally {
      setLoading(false);
    }
  };

  // Load tenants chỉ khi cần (khi mở drawer detail)
  const loadTenantsIfNeeded = async () => {
    if (!hasLoadedTenants) {
      try {
        const tenantsData = await adminTenantService.getAll({ limit: 50 });
        setTenants(tenantsData);
        setHasLoadedTenants(true);
      } catch (error: any) {
        message.error(
          error?.response?.data?.message || "Lỗi khi tải dữ liệu người thuê"
        );
      }
    }
  };

  // Load rooms chỉ khi cần (khi mở drawer detail)
  const loadRoomsIfNeeded = async () => {
    if (!hasLoadedRooms) {
      try {
        const roomsData = await adminRoomService.getAll();
        setRooms(roomsData);
        setHasLoadedRooms(true);
      } catch (error: any) {
        message.error(
          error?.response?.data?.message || "Lỗi khi tải dữ liệu phòng"
        );
      }
    }
  };

  const getContractInfo = (contractId: string | Contract): string => {
    if (typeof contractId === "object" && contractId?._id) {
      return contractId._id.substring(0, 8) + "...";
    }

    // Nếu backend đã populate contract data trong bill, không cần tìm trong contracts list
    const bill = bills.find(
      (b) =>
        (typeof b.contractId === "object" &&
          b.contractId?._id === contractId) ||
        (typeof b.contractId === "string" && b.contractId === contractId)
    );

    if (bill && typeof bill.contractId === "object") {
      return bill.contractId._id.substring(0, 8) + "...";
    }

    const contract = contracts.find((c) => c._id === contractId);
    return (
      contract?._id.substring(0, 8) + "..." ||
      (typeof contractId === "string"
        ? contractId.substring(0, 8) + "..."
        : "N/A")
    );
  };

  const filteredBills = useMemo(() => {
    return bills;
  }, [bills]);

  const paidCount = useMemo(
    () => bills.filter((b) => b.status === "PAID").length,
    [bills]
  );
  const unpaidCount = useMemo(
    () => bills.filter((b) => b.status === "UNPAID").length,
    [bills]
  );
  const partiallyPaidCount = useMemo(
    () => bills.filter((b) => b.status === "PARTIALLY_PAID").length,
    [bills]
  );

  // Bill type counts
  const receiptCount = useMemo(
    () => bills.filter((b) => b.billType === "RECEIPT").length,
    [bills]
  );
  const contractCount = useMemo(
    () => bills.filter((b) => b.billType === "CONTRACT").length,
    [bills]
  );
  const monthlyCount = useMemo(
    () => bills.filter((b) => b.billType === "MONTHLY").length,
    [bills]
  );

  const openDetail = async (bill: Bill) => {
    // Load tenants và rooms khi mở drawer detail (nếu chưa load)
    await Promise.all([loadTenantsIfNeeded(), loadRoomsIfNeeded()]);

    setSelectedBillId(bill._id);
    setDetailVisible(true);
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setSelectedBillId(undefined);
  };

  // Helper function để lấy tên khách hàng từ contract
  const getTenantName = (
    contractId: string | Contract | null | undefined,
    record: Bill
  ): string => {
    // Nếu contractId là object và đã được populate
    if (contractId && typeof contractId === "object" && contractId.tenantId) {
      if (
        typeof contractId.tenantId === "object" &&
        contractId.tenantId?.fullName
      ) {
        return contractId.tenantId.fullName;
      }
    }
    return "N/A";
  };

  // Helper function để lấy số phòng từ contract
  const getRoomNumber = (
    contractId: string | Contract | null | undefined,
    record: Bill
  ): string => {
    // Nếu contractId là object và đã được populate
    if (contractId && typeof contractId === "object" && contractId.roomId) {
      if (
        typeof contractId.roomId === "object" &&
        contractId.roomId?.roomNumber
      ) {
        return contractId.roomId.roomNumber;
      }
    }
    return "N/A";
  };

  const columns: ColumnsType<Bill> = [
    {
      title: "Khách hàng",
      dataIndex: "contractId",
      key: "tenantName",
      width: 200,
      render: (contractId: string | Contract, record: Bill) => {
        return <span>{getTenantName(contractId, record)}</span>;
      },
    },
    {
      title: "Phòng",
      dataIndex: "contractId",
      key: "roomNumber",
      width: 120,
      align: "center",
      render: (contractId: string | Contract, record: Bill) => {
        return <span>{getRoomNumber(contractId, record)}</span>;
      },
    },
    {
      title: "Loại",
      dataIndex: "billType",
      key: "billType",
      align: "center",
      render: (type: BillType) => {
        const map: Record<BillType, { color: string; text: string }> = {
          RECEIPT: { color: "purple", text: "Phiếu thu" },
          CONTRACT: { color: "cyan", text: "Hợp đồng" },
          MONTHLY: { color: "magenta", text: "Hàng tháng" },
        };
        const m = map[type] || { color: "default", text: type };
        return <Tag color={m.color}>{m.text}</Tag>;
      },
    },
    {
      title: "Ngày lập",
      dataIndex: "billingDate",
      key: "billingDate",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      align: "center",
      filters: [
        { text: "Nháp", value: "DRAFT" },
        { text: "Đã thanh toán", value: "PAID" },
        { text: "Chưa thanh toán", value: "UNPAID" },
        { text: "Thanh toán một phần", value: "PARTIALLY_PAID" },
        { text: "Chờ xác nhận tiền mặt", value: "PENDING_CASH_CONFIRM" },
      ],
      onFilter: (val, record) => record.status === val,
      render: (s: BillStatus) => {
        const map: Record<string, { color: string; text: string }> = {
          DRAFT: { color: "orange", text: "Nháp" },
          PAID: { color: "green", text: "Đã thanh toán" },
          UNPAID: { color: "red", text: "Chưa thanh toán" },
          PARTIALLY_PAID: { color: "orange", text: "Một phần" },
          VOID: { color: "default", text: "Đã hủy" },
          PENDING_CASH_CONFIRM: {
            color: "gold",
            text: "Chờ xác nhận tiền mặt",
          },
        };
        const m = map[s] || { color: "default", text: s || "Trạng thái" };
        return (
          <Tag color={m.color} className="tag-hover">
            {m.text}
          </Tag>
        );
      },
    },
    {
      title: "Phải thu (₫)",
      dataIndex: "amountDue",
      key: "amountDue",
      align: "right",
      render: (_: any, record: Bill) => {
        const due =
          typeof record.amountDue === "number" && !isNaN(record.amountDue)
            ? record.amountDue
            : 0;
        const paid =
          typeof record.amountPaid === "number" && !isNaN(record.amountPaid)
            ? record.amountPaid
            : 0;
        let display = due;
        if (record.status === "PAID") display = 0;
        else if (record.status === "PARTIALLY_PAID")
          display = Math.max(due - paid, 0);
        return display.toLocaleString("vi-VN");
      },
    },
    {
      title: "Đã thu (₫)",
      dataIndex: "amountPaid",
      key: "amountPaid",
      align: "right",
      render: (_: any, record: Bill) => {
        const due =
          typeof record.amountDue === "number" && !isNaN(record.amountDue)
            ? record.amountDue
            : 0;
        const paid =
          typeof record.amountPaid === "number" && !isNaN(record.amountPaid)
            ? record.amountPaid
            : 0;
        let display = paid;
        if (record.status === "UNPAID") display = 0;
        else if (record.status === "PARTIALLY_PAID")
          display = Math.min(paid, due);
        return display.toLocaleString("vi-VN");
      },
    },
  ];

  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title
              level={3}
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FileTextOutlined style={{ color: "#1890ff", fontSize: 28 }} />{" "}
              Quản lý Hóa đơn
            </Title>
          </Col>
        </Row>

        {/* Statistic - Status */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <div
              style={{ background: "#fafafa", padding: 16, borderRadius: 8 }}
            >
              <Title level={5} style={{ margin: "0 0 12px 0" }}>
                Lọc theo tình trạng thanh toán
              </Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <div
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 12,
                      textAlign: "center",
                      cursor: "pointer",
                      border:
                        statusFilter === "PAID"
                          ? "2px solid #52c41a"
                          : "1px solid #e8e8e8",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                    onClick={() => setStatusFilter("PAID")}
                  >
                    <FileTextOutlined
                      style={{
                        fontSize: 28,
                        color: "#52c41a",
                        marginBottom: 8,
                      }}
                    />
                    <Statistic
                      title="Đã thanh toán"
                      value={paidCount}
                      valueStyle={{ color: "#52c41a", fontWeight: 600 }}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 12,
                      textAlign: "center",
                      cursor: "pointer",
                      border:
                        statusFilter === "UNPAID"
                          ? "2px solid #ff4d4f"
                          : "1px solid #e8e8e8",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                    onClick={() => setStatusFilter("UNPAID")}
                  >
                    <FileTextOutlined
                      style={{
                        fontSize: 28,
                        color: "#ff4d4f",
                        marginBottom: 8,
                      }}
                    />
                    <Statistic
                      title="Chưa thanh toán"
                      value={unpaidCount}
                      valueStyle={{ color: "#ff4d4f", fontWeight: 600 }}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 12,
                      textAlign: "center",
                      cursor: "pointer",
                      border:
                        statusFilter === "PARTIALLY_PAID"
                          ? "2px solid #fa8c16"
                          : "1px solid #e8e8e8",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                    onClick={() => setStatusFilter("PARTIALLY_PAID")}
                  >
                    <FileTextOutlined
                      style={{
                        fontSize: 28,
                        color: "#fa8c16",
                        marginBottom: 8,
                      }}
                    />
                    <Statistic
                      title="Một phần"
                      value={partiallyPaidCount}
                      valueStyle={{ color: "#fa8c16", fontWeight: 600 }}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 12,
                      textAlign: "center",
                      cursor: "pointer",
                      border:
                        statusFilter === "ALL"
                          ? "2px solid #1890ff"
                          : "1px solid #e8e8e8",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                    onClick={() => setStatusFilter("ALL")}
                  >
                    <FileTextOutlined
                      style={{
                        fontSize: 28,
                        color: "#1890ff",
                        marginBottom: 8,
                      }}
                    />
                    <Statistic
                      title="Tất cả"
                      value={bills.length}
                      valueStyle={{ color: "#1890ff", fontWeight: 600 }}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* Statistic - Bill Type */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <div
              style={{ background: "#fafafa", padding: 16, borderRadius: 8 }}
            >
              <Title level={5} style={{ margin: "0 0 12px 0" }}>
                Lọc theo loại hóa đơn
              </Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <div
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 12,
                      textAlign: "center",
                      cursor: "pointer",
                      border:
                        billTypeFilter === "RECEIPT"
                          ? "2px solid #722ed1"
                          : "1px solid #e8e8e8",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                    onClick={() => setBillTypeFilter("RECEIPT")}
                  >
                    <FileTextOutlined
                      style={{
                        fontSize: 28,
                        color: "#722ed1",
                        marginBottom: 8,
                      }}
                    />
                    <Statistic
                      title="Phiếu thu (Cọc)"
                      value={receiptCount}
                      valueStyle={{ color: "#722ed1", fontWeight: 600 }}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 12,
                      textAlign: "center",
                      cursor: "pointer",
                      border:
                        billTypeFilter === "CONTRACT"
                          ? "2px solid #13c2c2"
                          : "1px solid #e8e8e8",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                    onClick={() => setBillTypeFilter("CONTRACT")}
                  >
                    <FileTextOutlined
                      style={{
                        fontSize: 28,
                        color: "#13c2c2",
                        marginBottom: 8,
                      }}
                    />
                    <Statistic
                      title="Hợp đồng (Tháng 1)"
                      value={contractCount}
                      valueStyle={{ color: "#13c2c2", fontWeight: 600 }}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 12,
                      textAlign: "center",
                      cursor: "pointer",
                      border:
                        billTypeFilter === "MONTHLY"
                          ? "2px solid #eb2f96"
                          : "1px solid #e8e8e8",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                    onClick={() => setBillTypeFilter("MONTHLY")}
                  >
                    <FileTextOutlined
                      style={{
                        fontSize: 28,
                        color: "#eb2f96",
                        marginBottom: 8,
                      }}
                    />
                    <Statistic
                      title="Hóa đơn hàng tháng"
                      value={monthlyCount}
                      valueStyle={{ color: "#eb2f96", fontWeight: 600 }}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 12,
                      textAlign: "center",
                      cursor: "pointer",
                      border:
                        billTypeFilter === "ALL"
                          ? "2px solid #1890ff"
                          : "1px solid #e8e8e8",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                    onClick={() => setBillTypeFilter("ALL")}
                  >
                    <FileTextOutlined
                      style={{
                        fontSize: 28,
                        color: "#1890ff",
                        marginBottom: 8,
                      }}
                    />
                    <Statistic
                      title="Tất cả loại"
                      value={bills.length}
                      valueStyle={{ color: "#1890ff", fontWeight: 600 }}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* Table */}
        <Table<Bill>
          columns={columns}
          dataSource={filteredBills}
          rowKey={(r) => r._id}
          loading={loading}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: [5, 8, 10, 20],
          }}
          size="middle"
          onRow={(record) => ({
            onClick: () => openDetail(record),
          })}
        />
      </div>

      {/* Drawer: Detail view */}
      <BillDetailDrawer
        open={detailVisible}
        onClose={closeDetail}
        billId={selectedBillId ?? null}
        contracts={contracts}
        tenants={tenants}
        rooms={rooms}
      />
    </div>
  );
};

export default BillsAD;
