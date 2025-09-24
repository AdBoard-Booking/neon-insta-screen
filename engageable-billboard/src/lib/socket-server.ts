import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { SocketEvents } from './socket';

export const initSocket = (httpServer: NetServer) => {
  const io = new ServerIO(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000'],
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join billboard room for real-time updates
    socket.join('billboard');

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const emitToBillboard = (io: ServerIO, event: string, data: any) => {
  io.to('billboard').emit(event, data);
};

export const emitNewUpload = (io: ServerIO, name: string) => {
  emitToBillboard(io, SocketEvents.NEW_UPLOAD, {
    name,
    message: `${name} just uploaded a selfie 👀`,
    timestamp: Date.now(),
  });
};

export const emitApprovedPost = (io: ServerIO, submission: any) => {
  emitToBillboard(io, SocketEvents.APPROVED_POST, {
    ...submission,
    timestamp: Date.now(),
  });
};

export const emitRejectedPost = (io: ServerIO, submissionId: string) => {
  emitToBillboard(io, SocketEvents.REJECTED_POST, {
    id: submissionId,
    timestamp: Date.now(),
  });
};