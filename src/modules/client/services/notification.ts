import api from './api';

export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedEntity?: string;
  relatedEntityId?: string;
  isRead: boolean;
  readAt?: string;
  metadata: any;
  priority: string;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

class NotificationService {
  /**
   * Lấy danh sách thông báo
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
    type?: string;
  }): Promise<NotificationListResponse> {
    const response = await api.get('/notifications-crud', { params });
    return response.data;
  }

  /**
   * Đếm số thông báo chưa đọc
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await api.get('/notifications-crud/unread-count');
    return response.data;
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  async markAsRead(notificationId: string): Promise<any> {
    const response = await api.put(`/notifications-crud/${notificationId}/read`);
    return response.data;
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  async markAllAsRead(): Promise<any> {
    const response = await api.put('/notifications-crud/read-all');
    return response.data;
  }

  /**
   * Xóa thông báo
   */
  async deleteNotification(notificationId: string): Promise<any> {
    const response = await api.delete(`/notifications-crud/${notificationId}`);
    return response.data;
  }

  /**
   * Xóa tất cả thông báo đã đọc
   */
  async deleteAllRead(): Promise<any> {
    const response = await api.delete('/notifications-crud/read-all');
    return response.data;
  }
}

export const clientNotificationService = new NotificationService();
