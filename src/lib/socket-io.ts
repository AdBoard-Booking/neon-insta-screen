import { Server as ServerIO } from 'socket.io';
import { SocketEvents } from './socket';

let io: ServerIO | null = null;

export const getSocketIO = (): ServerIO | null => {
  return io;
};

export const setSocketIO = (socketIO: ServerIO) => {
  io = socketIO;
};

export const emitToBillboard = (event: string, data: Record<string, any>) => {
  if (io) {
    io.to('billboard').emit(event, data);
  }
};

export const emitNewUpload = (name: string) => {
  emitToBillboard(SocketEvents.NEW_UPLOAD, {
    name,
    message: `${name} just uploaded a selfie 👀`,
    timestamp: Date.now(),
  });
};

export const emitApprovedPost = (submission: Record<string, any>) => {
  emitToBillboard(SocketEvents.APPROVED_POST, {
    ...submission,
    timestamp: Date.now(),
  });
};

export const emitRejectedPost = (submissionId: string) => {
  emitToBillboard(SocketEvents.REJECTED_POST, {
    id: submissionId,
    timestamp: Date.now(),
  });
};
