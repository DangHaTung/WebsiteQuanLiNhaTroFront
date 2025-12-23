import React, { useState, useEffect, useRef } from "react";
import { Input, Spin, Empty } from "antd";
import { SearchOutlined, HomeOutlined, UserOutlined, FileTextOutlined, FileDoneOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { adminRoomService } from "../../modules/admin/services/room";
import { adminTenantService } from "../../modules/admin/services/tenant";
import { adminBillService } from "../../modules/admin/services/bill";
import { adminContractService } from "../../modules/admin/services/contract";
import "../../assets/styles/globalSearch.css";

interface SearchResult {
  id: string;
  type: "room" | "tenant" | "bill" | "contract";
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  path: string;
}

const GlobalSearch: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tìm kiếm với debounce
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (keyword.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(keyword.trim());
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [keyword]);

  const performSearch = async (query: string) => {
    setLoading(true);
    setShowDropdown(true);
    const searchResults: SearchResult[] = [];

    try {
      const lowerQuery = query.toLowerCase();

      // Tìm phòng
      try {
        const rooms = await adminRoomService.getAll();
        const matchedRooms = rooms.filter((room: any) =>
          room.roomNumber?.toString().toLowerCase().includes(lowerQuery) ||
          room.type?.toLowerCase().includes(lowerQuery) ||
          room.pricePerMonth?.toString().includes(lowerQuery)
        ).slice(0, 5);

        matchedRooms.forEach((room: any) => {
          const statusMap: Record<string, string> = {
            AVAILABLE: "Còn trống",
            OCCUPIED: "Đang thuê",
            DEPOSITED: "Đã cọc",
            MAINTENANCE: "Bảo trì"
          };
          searchResults.push({
            id: room._id,
            type: "room",
            title: `Phòng ${room.roomNumber}`,
            subtitle: `${statusMap[room.status] || room.status} - ${room.pricePerMonth?.toLocaleString()}₫`,
            icon: <HomeOutlined style={{ color: "#1890ff" }} />,
            path: `/admin/roomsad?roomId=${room._id}`
          });
        });
      } catch (error) {
        console.error("Error searching rooms:", error);
      }

      // Tìm khách thuê
      try {
        const tenants = await adminTenantService.getAll({ limit: 50 });
        const tenantsArray = Array.isArray(tenants) ? tenants : [];
        const matchedTenants = tenantsArray.filter((tenant: any) =>
          tenant.fullName?.toLowerCase().includes(lowerQuery) ||
          tenant.phone?.includes(lowerQuery) ||
          tenant.email?.toLowerCase().includes(lowerQuery)
        ).slice(0, 5);

        matchedTenants.forEach((tenant: any) => {
          searchResults.push({
            id: tenant._id || tenant.id,
            type: "tenant",
            title: tenant.fullName || "Khách thuê",
            subtitle: tenant.phone || tenant.email || "",
            icon: <UserOutlined style={{ color: "#52c41a" }} />,
            path: `/admin/contracts?tenantId=${tenant._id || tenant.id}`
          });
        });
      } catch (error) {
        console.error("Error searching tenants:", error);
      }

      // Tìm hóa đơn
      try {
        const bills: any = await adminBillService.getAll({ limit: 100 });
        const billsArray = Array.isArray(bills) ? bills : bills?.data || [];
        const matchedBills = billsArray.filter((bill: any) =>
          bill._id?.toLowerCase().includes(lowerQuery) ||
          bill.amountDue?.toString().includes(lowerQuery)
        ).slice(0, 5);

        matchedBills.forEach((bill: any) => {
          const statusMap: Record<string, string> = {
            PAID: "Đã thanh toán",
            UNPAID: "Chưa thanh toán",
            PARTIALLY_PAID: "Thanh toán một phần",
            PENDING_CASH_CONFIRM: "Chờ xác nhận"
          };
          searchResults.push({
            id: bill._id,
            type: "bill",
            title: `HD-${bill._id.substring(0, 8)}...`,
            subtitle: `${statusMap[bill.status] || bill.status} - ${bill.amountDue?.toLocaleString()}₫`,
            icon: <FileTextOutlined style={{ color: "#fa8c16" }} />,
            path: `/admin/bills?billId=${bill._id}`
          });
        });
      } catch (error) {
        console.error("Error searching bills:", error);
      }

      // Tìm hợp đồng
      try {
        const contracts = await adminContractService.getAll({ limit: 50 });
        const contractsArray = Array.isArray(contracts) ? contracts : [];
        const matchedContracts = contractsArray.filter((contract: any) =>
          contract._id?.toLowerCase().includes(lowerQuery)
        ).slice(0, 5);

        matchedContracts.forEach((contract: any) => {
          const tenantName = typeof contract.tenantId === "object" ? contract.tenantId?.fullName : "";
          const roomNumber = typeof contract.roomId === "object" ? contract.roomId?.roomNumber : "";
          searchResults.push({
            id: contract._id,
            type: "contract",
            title: `HĐ-${contract._id.substring(0, 8)}...`,
            subtitle: `${tenantName} - Phòng ${roomNumber}`,
            icon: <FileDoneOutlined style={{ color: "#722ed1" }} />,
            path: `/admin/final-contracts?contractId=${contract._id}`
          });
        });
      } catch (error) {
        console.error("Error searching contracts:", error);
      }

      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectResult(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    navigate(result.path);
    setKeyword("");
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const categoryLabels: Record<string, string> = {
    room: "📋 Phòng",
    tenant: "👤 Khách thuê",
    bill: "💰 Hóa đơn",
    contract: "📄 Hợp đồng"
  };

  return (
    <div className="global-search-container" ref={searchRef}>
      <Input
        size="large"
        placeholder="Tìm phòng, khách thuê, hóa đơn, hợp đồng..."
        prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => keyword.trim().length >= 2 && setShowDropdown(true)}
        className="global-search-input"
        suffix={loading ? <Spin size="small" /> : null}
      />

      {showDropdown && (
        <div className="global-search-dropdown">
          {loading ? (
            <div className="search-loading">
              <Spin />
              <span>Đang tìm kiếm...</span>
            </div>
          ) : results.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không tìm thấy kết quả"
              style={{ padding: "20px 0" }}
            />
          ) : (
            <div className="search-results">
              {Object.entries(groupedResults).map(([type, items]) => (
                <div key={type} className="result-category">
                  <div className="category-label">
                    {categoryLabels[type]} ({items.length})
                  </div>
                  {items.map((result) => {
                    const globalIndex = results.indexOf(result);
                    return (
                      <div
                        key={result.id}
                        className={`result-item ${selectedIndex === globalIndex ? "selected" : ""}`}
                        onClick={() => handleSelectResult(result)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div className="result-icon">{result.icon}</div>
                        <div className="result-content">
                          <div className="result-title">{result.title}</div>
                          <div className="result-subtitle">{result.subtitle}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
