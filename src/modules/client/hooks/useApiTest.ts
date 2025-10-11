import { useState, useEffect } from "react";
import api from "../services/api";

export const useApiTest = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test connection bằng cách gọi một endpoint đơn giản
        // Tạm thời comment vì chưa có endpoint test
        // const response = await api.get("/health");
        setIsConnected(true);
        setError(null);
      } catch (err: any) {
        setIsConnected(false);
        setError(err.message || "Không thể kết nối đến server");
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return { isConnected, loading, error };
};
