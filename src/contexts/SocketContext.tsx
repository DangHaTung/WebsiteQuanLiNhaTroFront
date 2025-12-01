import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { message as antMessage } from 'antd';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  metadata: any;
  actionUrl?: string;
  createdAt: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('⚠️ No token found, skipping socket connection');
      return;
    }

    // Kết nối Socket.IO
    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    console.log('🔌 Connecting to Socket.IO:', SOCKET_URL);
    
    const newSocket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Event: Connected
    newSocket.on('connect', () => {
      console.log('✅ Socket.IO connected:', newSocket.id);
      setIsConnected(true);
    });

    // Event: Connection error
    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error.message);
      setIsConnected(false);
    });

    // Event: Disconnected
    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason);
      setIsConnected(false);
    });

    // Event: Connected confirmation from server
    newSocket.on('connected', (data) => {
      console.log('📡 Server confirmed connection:', data);
    });

    // Event: New notification
    newSocket.on('new-notification', (data: { notification: Notification }) => {
      console.log('🔔 New notification received:', data.notification);
      
      const notification = data.notification;
      
      // Add to notifications list
      addNotification(notification);
      
      // Show toast notification
      const priorityConfig = {
        URGENT: { duration: 10, type: 'error' as const },
        HIGH: { duration: 6, type: 'warning' as const },
        MEDIUM: { duration: 4, type: 'info' as const },
        LOW: { duration: 3, type: 'info' as const },
      };
      
      const config = priorityConfig[notification.priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;
      
      antMessage.open({
        type: config.type,
        content: (
          <div>
            <strong>{notification.title}</strong>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>{notification.message}</div>
          </div>
        ),
        duration: config.duration,
        onClick: () => {
          if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
          }
        },
        style: {
          cursor: notification.actionUrl ? 'pointer' : 'default',
        },
      });
    });

    // Event: Pong (response to ping)
    newSocket.on('pong', (data) => {
      console.log('🏓 Pong received:', data);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('🔌 Disconnecting socket...');
      newSocket.disconnect();
    };
  }, []); // Empty dependency array - only run once on mount

  // Ping every 30 seconds to keep connection alive
  useEffect(() => {
    if (!socket || !isConnected) return;

    const pingInterval = setInterval(() => {
      socket.emit('ping');
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [socket, isConnected]);

  const value: SocketContextType = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    addNotification,
    clearNotifications,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
