import { apiClient } from '@/lib/api-client';

export enum NotificationType {
  REACTION = 'REACTION',
  COMMENT = 'COMMENT',
  EARN_POINTS = 'EARN_POINTS',
  SCORE_UP = 'SCORE_UP',
  SCORE_DOWN = 'SCORE_DOWN',
  REPORT_RESULT = 'REPORT_RESULT',
  SUBSCRIPTION_START = 'SUBSCRIPTION_START',
  SUBSCRIPTION_END = 'SUBSCRIPTION_END',
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  data: Notification[];
  meta: {
    hasMore: boolean;
    lastId: string | null;
    count: number;
    unreadCount: number;
  };
}

export const notificationService = {
  async getMyNotifications(lastId?: string, limit: number = 20): Promise<NotificationResponse> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (lastId) {
      params.append('lastId', lastId);
    }
    
    const response = await apiClient.get(`/notification?${params.toString()}`);
    return response.data as NotificationResponse;
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await apiClient.get('/notification/unread-count');
    return response.data as { count: number };
  },

  async markAsRead(notificationIds?: string[]): Promise<{ modifiedCount: number; message: string }> {
    const response = await apiClient.patch('/notification/mark-as-read', { 
      body: { notificationIds } 
    });
    return response.data as { modifiedCount: number; message: string };
  },

  async markAllAsRead(): Promise<{ modifiedCount: number; message: string }> {
    const response = await apiClient.patch('/notification/mark-all-as-read');
    return response.data as { modifiedCount: number; message: string };
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notification/${id}`);
  },
};
