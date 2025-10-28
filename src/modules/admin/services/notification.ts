import api from "./api";

export type Notification = {
  _id: string;
  recipientId: string;
  recipientRole: string;
  type: string;
  title: string;
  message: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Paginated<T> = {
  message: string;
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
};

export const adminNotificationService = {
  async list(page = 1, limit = 10, isRead?: boolean) {
    const params: any = { page, limit };
    if (isRead !== undefined) {
      params.isRead = isRead;
    }
    const { data } = await api.get("/notifications", { params });
    return data as Paginated<Notification>;
  },

  async getUnreadCount() {
    const { data } = await api.get("/notifications/unread/count");
    return data as { success: boolean; data: { count: number } };
  },

  async markAsRead(id: string) {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data as { message: string; success: boolean; data: Notification };
  },

  async markAllAsRead() {
    const { data } = await api.put("/notifications/read/all");
    return data as { message: string; success: boolean };
  },

  async remove(id: string) {
    const { data } = await api.delete(`/notifications/${id}`);
    return data as { message: string; success: boolean };
  },
};


