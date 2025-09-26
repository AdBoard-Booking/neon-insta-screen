import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketEvents } from './socket';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only create socket if not already exists
    if (socket) return;

    const socketInstance = io(process.env.NODE_ENV === 'production' 
      ? 'https://tulip.adboardtools.com' 
      : 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.io server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Socket.io server');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.removeAllListeners();
        socketInstance.close();
      }
    };
  }, []);

  return { socket, isConnected };
};

export const useFOMOBanner = () => {
  const [fomoBanner, setFomoBanner] = useState<{
    id: string;
    name: string;
    message: string;
    timestamp: number;
  } | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewUpload = (data: { name: string; message: string; timestamp: number }) => {
      setFomoBanner({
        id: data.timestamp.toString(),
        name: data.name,
        message: data.message,
        timestamp: data.timestamp,
      });

      // Hide banner after 3 seconds
      setTimeout(() => {
        setFomoBanner(null);
      }, 3000);
    };

    socket.on(SocketEvents.NEW_UPLOAD, handleNewUpload);

    return () => {
      socket.off(SocketEvents.NEW_UPLOAD, handleNewUpload);
    };
  }, [socket]);

  return fomoBanner;
};

export const useBillboardUpdates = () => {
  const { socket } = useSocket();
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleApprovedPost = async (data: any) => {
      console.log('Setting shouldRefresh to true');
      setShouldRefresh(true);
    };

    socket.on(SocketEvents.BILLBOARD_UPDATE, handleApprovedPost);
    // socket.on(SocketEvents.REJECTED_POST, handleRejectedPost);

    return () => {
      // socket.off(SocketEvents.APPROVED_POST, handleApprovedPost);
      socket.off(SocketEvents.BILLBOARD_UPDATE, handleApprovedPost);
    };
  }, [socket]);

  return { shouldRefresh, setShouldRefresh };
};
