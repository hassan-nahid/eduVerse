'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { type Notification, notificationService } from '@/services/notification.service';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  loadNotifications: (reset?: boolean) => Promise<void>;
  markAsRead: (notificationIds?: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastId, setLastId] = useState<string | null>(null);
  const unreadCountRef = useRef(0);
  const lastNotifiedIdRef = useRef<string | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  // Request browser notification permission
  useEffect(() => {
    if (isAuthenticated && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isAuthenticated]);

  const loadNotifications = useCallback(async (reset = false) => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const currentLastId = reset ? undefined : lastId || undefined;
      const response = await notificationService.getMyNotifications(currentLastId);
      
      // Handle response safely
      if (response && response.data) {
        if (reset) {
          setNotifications(response.data);
        } else {
          setNotifications((prev) => [...prev, ...response.data]);
        }
        
        // Safely access meta properties with defaults
        if (response.meta) {
          setHasMore(response.meta.hasMore ?? false);
          setLastId(response.meta.lastId ?? null);
          setUnreadCount(response.meta.unreadCount ?? 0);
        } else {
          setHasMore(false);
          setLastId(null);
        }
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Reset to safe defaults on error
      if (reset) {
        setNotifications([]);
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, lastId]);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Failed to refresh unread count:', error);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (notificationIds?: string[]) => {
    if (!isAuthenticated) return;
    
    try {
      await notificationService.markAsRead(notificationIds);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          !notificationIds || notificationIds.includes(n._id) ? { ...n, isRead: true } : n
        )
      );
      
      // Refresh unread count
      await refreshUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [isAuthenticated, refreshUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [isAuthenticated]);

  const deleteNotification = useCallback(async (id: string) => {
    if (!isAuthenticated) return;
    
    try {
      await notificationService.deleteNotification(id);
      
      // Update local state
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      
      // Refresh unread count
      await refreshUnreadCount();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [isAuthenticated, refreshUnreadCount]);

  // Load notifications on mount and set up polling
  useEffect(() => {
    if (isAuthenticated) {
      // Initial load
      const initialLoad = async () => {
        await loadNotifications(true);
      };
      initialLoad();
      
      // Poll for new notifications every 5 seconds for real-time updates
      const interval = setInterval(async () => {
        try {
          const response = await notificationService.getUnreadCount();
          const newUnreadCount = response.count;
          const previousUnreadCount = unreadCountRef.current;
          
          // Update unread count
          setUnreadCount(newUnreadCount);
          
          // If new notifications arrived, reload the list and show browser notification
          if (newUnreadCount > previousUnreadCount) {
            const result = await notificationService.getMyNotifications(undefined, 1);
            
            // Reload all notifications
            await loadNotifications(true);
            
            // Show browser push notification for the latest unread notification
            if ('Notification' in window && Notification.permission === 'granted' && result.data.length > 0) {
              const latestNotification = result.data[0];
              
              // Only show if it's a new notification (different from last notified)
              if (latestNotification._id !== lastNotifiedIdRef.current) {
                lastNotifiedIdRef.current = latestNotification._id;
                
                const notification = new Notification('eduVerse - New Notification', {
                  body: latestNotification.message,
                  icon: '/favicon.ico',
                  badge: '/favicon.ico',
                  tag: latestNotification._id,
                  requireInteraction: false,
                });
                
                // Auto close after 5 seconds
                setTimeout(() => notification.close(), 5000);
              }
            }
          }
        } catch (error) {
          console.error('Failed to poll notifications:', error);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    } else {
      // Clear notifications when logged out
      setNotifications([]);
      setUnreadCount(0);
      setLastId(null);
      setHasMore(true);
      unreadCountRef.current = 0;
      lastNotifiedIdRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
