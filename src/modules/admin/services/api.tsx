import axios, { AxiosHeaders } from "axios";
import type { AxiosRequestHeaders } from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use(
  (config) => {
    // Kiểm tra cả admin_token và token (vì có thể đăng nhập từ form chung)
    const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
    
    if (token) {
      if (config.headers instanceof AxiosHeaders) {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        config.headers = {
          ...(config.headers as Record<string, any> | undefined),
          Authorization: `Bearer ${token}`,
        } as AxiosRequestHeaders;
      }
    }
    
    // Debug: Log request data for calculate fees endpoint
    if (config.url?.includes('/fees/calculate') && config.data) {
      console.log(`[api interceptor] Request to ${config.url}:`, {
        method: config.method,
        data: config.data,
        dataType: typeof config.data,
        dataKeys: Object.keys(config.data || {}),
        vehicleCount: config.data.vehicleCount,
        kwh: config.data.kwh,
        occupantCount: config.data.occupantCount,
        stringified: JSON.stringify(config.data),
      });
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_currentUser");
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      window.location.href = "/login?from=admin";
    }
    return Promise.reject(error);
  }
);

export default api;
