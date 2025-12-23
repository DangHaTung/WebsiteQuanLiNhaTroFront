import api from './api';

export interface Log {
  _id: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  context: {
    entity: 'ROOM' | 'CONTRACT' | 'BILL' | 'USER' | 'CHECKIN' | 'FINALCONTRACT' | 'PAYMENT';
    entityId: string;
    actorId?: {
      _id: string;
      fullName: string;
      email: string;
      role: string;
    };
    diff?: any;
    entityRef: string;
  };
  createdAt: string;
}

export interface LogsResponse {
  message: string;
  data: Log[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}

export interface LogStatsResponse {
  message: string;
  data: {
    summary: {
      total: number;
      errors: number;
      warnings: number;
      info: number;
    };
    details: any[];
  };
}

export const adminLogService = {
  // Lấy danh sách logs
  getAll: async (params?: {
    page?: number;
    limit?: number;
    level?: string;
    entity?: string;
    actorId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<LogsResponse> => {
    const response = await api.get('/logs', { params });
    return response.data;
  },

  // Lấy log theo ID
  getById: async (id: string): Promise<{ message: string; data: Log }> => {
    const response = await api.get(`/logs/${id}`);
    return response.data;
  },

  // Lấy thống kê logs
  getStats: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'level' | 'entity' | 'actor';
  }): Promise<LogStatsResponse> => {
    const response = await api.get('/logs/stats', { params });
    return response.data;
  },

  // Lấy logs theo entity
  getByEntity: async (
    entity: string,
    entityId: string,
    params?: { page?: number; limit?: number }
  ): Promise<LogsResponse> => {
    const response = await api.get(`/logs/entity/${entity}/${entityId}`, { params });
    return response.data;
  },

  // Xóa logs cũ
  cleanup: async (params?: { days?: number; level?: string }): Promise<any> => {
    const response = await api.get('/logs/cleanup', { params });
    return response.data;
  },
};
