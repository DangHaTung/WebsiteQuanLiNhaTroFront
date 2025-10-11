import React from "react";
import { Input } from "antd";
import "../../assets/styles/search.css";
const { Search } = Input;

interface SearchBarProps {
    placeholder?: string;
    onSearch?: (value: string) => void;
    width?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = "Tìm kiếm...",
    onSearch = (value) => console.log("Search:", value),
    width = 250,
}) => {
    return (
        <Search
            placeholder={placeholder}
            onSearch={onSearch}
            allowClear
            enterButton
            style={{
                width,
                transition: "all 0.3s",
            }}
        />
    );
};

export default SearchBar;
