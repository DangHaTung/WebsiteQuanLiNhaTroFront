import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Tooltip, List, Spin } from "antd";
import { SearchOutlined, UserOutlined, HomeOutlined, FileTextOutlined, DollarOutlined, MessageOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../modules/admin/services/api";
import { message } from 'antd';
import "../../assets/styles/search.css";

interface SearchResult {
    id: string;
    type: "tenant" | "room" | "contract" | "bill" | "complaint";
    title: string;
    description?: string;
}

interface SearchBarProps {
    placeholder?: string;
    width?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = "Tìm người thuê, phòng, hợp đồng, hóa đơn...",
    width = 260,
}) => {
    const [value, setValue] = useState("");
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigate = useNavigate();

    const icons: Record<string, React.ReactNode> = {
        tenant: <UserOutlined style={{ color: "#1677ff" }} />,
        room: <HomeOutlined style={{ color: "#52c41a" }} />,
        contract: <FileTextOutlined style={{ color: "#faad14" }} />,
        bill: <DollarOutlined style={{ color: "#722ed1" }} />,
        complaint: <MessageOutlined style={{ color: "#eb2f96" }} />,
    };

    const fetchResults = async (keyword: string) => {
        if (!keyword.trim()) return setResults([]);
        setLoading(true);
        try {
            console.log('Sending search request with token:', localStorage.getItem('admin_token'));
            const res = await api.get(`/search?keyword=${keyword}`);
            console.log('Search response:', res.data);
            const data = res.data;
            if (data.success) {
                setResults(data.data || []);
            } else {
                message.error('Không tìm thấy kết quả: ' + data.message);
                setResults([]);
            }
        } catch (err: any) {
            message.error('Đã xảy ra lỗi khi tìm kiếm: ' + (err.response?.data?.message || err.message));
            console.error('Lỗi tìm kiếm:', err.response || err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounce tìm kiếm
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            if (value.trim()) fetchResults(value);
            else setResults([]);
        }, 400);
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [value]);

    const handleSelect = (item: SearchResult) => {
        const filters = {
            search: value,
            type: item.type,
            id: item.id
        };
        const searchParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) searchParams.set(key, value);
        });

        const queryString = searchParams.toString();
        switch (item.type) {
            case "tenant":
                navigate(`/admin/users?${queryString}`);
                break;
            case "room":
                navigate(`/admin/roomsad?${queryString}`);
                break;
            case "contract":
                navigate(`/admin/contracts?${queryString}`);
                break;
            case "bill":
                navigate(`/admin/bills?${queryString}`);
                break;
            case "complaint":
                navigate(`/admin/complaints?${queryString}`);
                break;
        }
        setResults([]);
        setValue("");
    };

    return (
        <div className="global-search-wrapper" style={{ position: "relative", zIndex: 9999 }}>
            <div
                className={`search-bar-container ${focused ? "focused" : ""}`}
                style={{ width: focused ? width + 100 : width }}
            >
                <Tooltip title="Tìm kiếm toàn hệ thống" placement="bottom">
                    <Input
                        value={value}
                        placeholder={placeholder}
                        onChange={(e) => setValue(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setTimeout(() => setFocused(false), 150)} // delay nhỏ tránh mất dropdown khi click
                        className="search-input"
                    />
                </Tooltip>
                <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        fetchResults(value);
                    }}
                    shape="circle"
                    className={`search-button ${hovered ? "hovered" : ""}`}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    <span className="search-shimmer"></span>
                </Button>
            </div>

            {focused && value && (
                <div
                    className="global-search-dropdown"
                    style={{
                        top: "calc(100% + 5px)",
                        left: "0",
                        width: focused ? width + 100 : width,
                        maxHeight: "calc(100vh - 200px)",
                        overflowY: "auto",
                    }}
                >
                    {loading ? (
                        <div style={{ padding: "12px", textAlign: "center" }}>
                            <Spin size="small" /> Đang tìm kiếm kết quả...
                        </div>
                    ) : results.length > 0 ? (
                        <List
                            size="small"
                            dataSource={results}
                            renderItem={(item) => (
                                <List.Item
                                    onMouseDown={() => handleSelect(item)}
                                    className="search-item"
                                    style={{ cursor: "pointer", padding: "10px 14px" }}
                                >
                                    <List.Item.Meta
                                        avatar={icons[item.type]}
                                        title={<strong>{item.title}</strong>}
                                        description={<span style={{ color: "#888" }}>{item.description}</span>}
                                    />
                                </List.Item>
                            )}
                        />
                    ) : (
                        <div className="no-result">
                            <div className="no-result-icon">
                                <SearchOutlined className="search-icon" />
                            </div>
                            Không tìm thấy kết quả phù hợp
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default SearchBar;
