import { useState, useRef, useEffect } from "react";
import { Input, Button } from "antd";
import type { InputRef } from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
// Props cho ExpandableSearch component
interface ExpandableSearchProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    maxWidth?: number;
}
// Component thanh tìm kiếm mở rộng
const ExpandableSearch = ({
    value,
    onChange,
    placeholder = "Tìm kiếm...",
    maxWidth = 250,
    //...rest
}: ExpandableSearchProps) => {
    const [open, setOpen] = useState(false);
    const [hover, setHover] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<InputRef>(null);
// Tự động focus input khi mở
    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);
/// Đóng khi click ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
            // Đóng khi nhấn Escape
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
// Màu nền gradient
    const gradientColors = "linear-gradient(135deg, #0d6efd, #0dcaf0)";

    return (
        <div
        // Bao quanh component
            ref={wrapperRef}
            style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
                borderRadius: 50,
                boxShadow: hover
                    ? "0 6px 16px rgba(0,0,0,0.2)"
                    : "0 2px 8px rgba(0,0,0,0.08)",
                overflow: "hidden",
                transition: "all 0.4s ease",
                width: open ? maxWidth + 50 : 50,
                background: gradientColors,
            }}
            // Xuất hiện khi hover
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <Input
                ref={inputRef}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={{
                    // Hiển thị input khi mở
                    width: open ? maxWidth : 0,
                    opacity: open ? 1 : 0,
                    transition: "width 0.4s ease, opacity 0.4s ease, padding 0.4s ease",
                    border: "none",
                    borderRadius: 50,
                    padding: open ? "0 16px" : 0,
                    height: 50,
                    lineHeight: "50px",
                    boxSizing: "border-box",
                    outline: "none",
                }}
            />
            <Button
                type="primary"
                onClick={() => setOpen(!open)}
                style={{
                    position: "relative",
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: -1,
                    flexShrink: 0,
                    background: hover ? gradientColors : "#40a9ff",
                    borderColor: hover ? "transparent" : "#40a9ff",
                    transform: hover ? "scale(1.15)" : "scale(1)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    color: "#fff",
                    overflow: "hidden",
                }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                {open ? <CloseOutlined /> : <SearchOutlined />}

                {/* Light sweep effect */}
                <span
                    style={{
                        position: "absolute",
                        top: 0,
                        left: hover ? "-75%" : "125%",
                        width: "50%",
                        height: "100%",
                        background:
                            "linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)",
                        transform: "skewX(-20deg)",
                        animation: hover
                            ? "shineForward 0.8s forwards"
                            : "shineBackward 0.8s forwards",
                        pointerEvents: "none",
                    }}
                />

                <style>
                    {`
                    @keyframes shineForward {
                        0% { left: -75%; }
                        100% { left: 125%; }
                    }
                    @keyframes shineBackward {
                        0% { left: 125%; }
                        100% { left: -75%; }
                    }
                    `}
                </style>
            </Button>


        </div>
    );
};

export default ExpandableSearch;
