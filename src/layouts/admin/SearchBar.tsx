import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import "../../assets/styles/search.css";

interface SearchBarProps {
    placeholder?: string;
    onSearch?: (value: string) => void;
    width?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = "Tìm kiếm...",
    onSearch = (value) => console.log("Search:", value),
    width = 260,
}) => {
    const [value, setValue] = useState("");
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            if (value.trim()) onSearch(value);
        }, 300);
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [value]);

    return (
        <div
            className={`search-bar-container ${focused ? "focused" : ""}`}
            style={{ width: focused ? width + 100 : width }}
        >
            <Tooltip placement="bottom">
                <Input
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="search-input"
                />
            </Tooltip>
            <Button
                type="primary"
                icon={<SearchOutlined />}
                onMouseDown={(e) => {
                    e.preventDefault();
                    onSearch(value);
                }}
                shape="circle"
                className={`search-button ${hovered ? "hovered" : ""}`}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <span className="search-shimmer"></span>
            </Button>
        </div>
    );
};

export default SearchBar;
