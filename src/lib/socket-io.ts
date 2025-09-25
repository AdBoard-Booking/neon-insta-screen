import { Server as ServerIO } from 'socket.io';
import { SocketEvents } from './socket';

// Use global io instance from custom server
declare global {
  var io: ServerIO | undefined;
}

export const getSocketIO = (): ServerIO | null => {
  return global.io || null;
};

export const setSocketIO = (socketIO: ServerIO) => {
  global.io = socketIO;
};

export const emitToBillboard = (event: string, data: Record<string, unknown>) => {
  const io = getSocketIO();
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

export const emitApprovedPost = (submission: Record<string, unknown>) => {
  console.log('Emitting approved post:', submission);
  console.log('Socket IO instance:', io ? 'exists' : 'null');
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

export const emitDeletedPost = (submissionId: string) => {
  emitToBillboard(SocketEvents.BILLBOARD_UPDATE, {
    id: submissionId,
    action: 'deleted',
    timestamp: Date.now(),
  });
};
