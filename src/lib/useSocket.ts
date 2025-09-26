import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketEvents } from './socket';

// Extend window interface for global socket instance
declare global {
  interface Window {
    globalSocketInstance?: Socket | null;
  }
}

// Global socket instance to prevent multiple connections
let globalSocketInstance: Socket | null = null;

// Store reference in window for cleanup utility
if (typeof window !== 'undefined') {
  window.globalSocketInstance = globalSocketInstance;
}

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Use existing socket instance if available
    if (globalSocketInstance && globalSocketInstance.connected) {
      socketRef.current = globalSocketInstance;
      setIsConnected(true);
      return;
    }

    // Create new socket instance
    const socketInstance = io(process.env.NODE_ENV === 'production' 
      ? 'https://tulip.adboardtools.com' 
      : 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false, // Reuse existing connection
    });

    // Store globally and in ref
    globalSocketInstance = socketInstance;
    socketRef.current = socketInstance;
    
    // Update window reference for cleanup utility
    if (typeof window !== 'undefined') {
      window.globalSocketInstance = globalSocketInstance;
    }

    const handleConnect = () => {
      console.log('Connected to Socket.io server');
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    const handleDisconnect = (reason: string) => {
      console.log('Disconnected from Socket.io server:', reason);
      setIsConnected(false);
    };

    const handleConnectError = (error: Error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    };

    const handleReconnect = (attemptNumber: number) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
    };

    const handleReconnectFailed = () => {
      console.error('Failed to reconnect to Socket.io server');
      setIsConnected(false);
      // Clear global instance if reconnection fails completely
      globalSocketInstance = null;
    };

    // Add event listeners
    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('connect_error', handleConnectError);
    socketInstance.on('reconnect', handleReconnect);
    socketInstance.on('reconnect_failed', handleReconnectFailed);

    // Set initial connection state
    setIsConnected(socketInstance.connected);

    return () => {
      // Only cleanup if this is the last component using the socket
      if (socketRef.current === globalSocketInstance) {
        socketInstance.removeAllListeners();
        // Don't close the connection immediately, let other components use it
        // The connection will be closed when the page is unloaded
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array is correct here

  return { socket: socketRef.current, isConnected };
};

export const useFOMOBanner = () => {
  const [fomoBanner, setFomoBanner] = useState<{
    id: string;
    name: string;
    message: string;
    timestamp: number;
  } | null>(null);
  const { socket } = useSocket();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleNewUpload = (data: { name: string; message: string; timestamp: number }) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setFomoBanner({
        id: data.timestamp.toString(),
        name: data.name,
        message: data.message,
        timestamp: data.timestamp,
      });

      // Hide banner after 3 seconds
      timeoutRef.current = setTimeout(() => {
        setFomoBanner(null);
        timeoutRef.current = null;
      }, 3000);
    };

    socket.on(SocketEvents.NEW_UPLOAD, handleNewUpload);

    return () => {
      socket.off(SocketEvents.NEW_UPLOAD, handleNewUpload);
      // Clear timeout on cleanup
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [socket]);

  return fomoBanner;
};

export const useBillboardUpdates = () => {
  const { socket } = useSocket();
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleBillboardUpdate = (data: Record<string, unknown>) => {
      console.log('Billboard update received:', data);
      
      // Clear any existing refresh timeout to prevent duplicate refreshes
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      setShouldRefresh(true);
      
      // Auto-reset shouldRefresh after a short delay to prevent infinite loops
      refreshTimeoutRef.current = setTimeout(() => {
        setShouldRefresh(false);
        refreshTimeoutRef.current = null;
      }, 100);
    };

    socket.on(SocketEvents.BILLBOARD_UPDATE, handleBillboardUpdate);

    return () => {
      socket.off(SocketEvents.BILLBOARD_UPDATE, handleBillboardUpdate);
      // Clear timeout on cleanup
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [socket]);

  return { shouldRefresh, setShouldRefresh };
};
