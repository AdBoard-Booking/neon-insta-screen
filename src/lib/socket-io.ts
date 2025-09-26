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
    try {
      io.to('billboard').emit(event, data);
      console.log(`Emitted ${event} to billboard room:`, data);
    } catch (error) {
      console.error(`Error emitting ${event} to billboard:`, error);
    }
  } else {
    console.warn('Socket.io instance not available for billboard emission');
  }
};

export const emitNewUpload = (name: string) => {
  const messages = [
    `🔥 ${name} just joined the billboard! Don't miss out!`,
    `📸 ${name} is now on the big screen! Your turn next?`,
    `✨ ${name} just uploaded! Join the fun!`,
    `🎉 ${name} is trending! Upload your selfie now!`,
    `💫 ${name} just shared their moment! Be next!`,
    `🌟 ${name} is live! Don't be left behind!`
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  emitToBillboard(SocketEvents.NEW_UPLOAD, {
    name,
    message: randomMessage,
    timestamp: Date.now(),
  });
};

export const emitApprovedPost = (submission: Record<string, unknown>) => {
  console.log('Emitting approved post:', submission);
  const io = getSocketIO();
  console.log('Socket IO instance:', io ? 'exists' : 'null');
  emitToBillboard(SocketEvents.BILLBOARD_UPDATE, {
    ...submission,
    timestamp: Date.now(),
  });
};

export const emitRejectedPost = (submissionId: string) => {
  emitToBillboard(SocketEvents.BILLBOARD_UPDATE, {
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
