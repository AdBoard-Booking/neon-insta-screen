import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export const SocketEvents = {
  NEW_UPLOAD: 'new_upload',
  APPROVED_POST: 'approved_post',
  REJECTED_POST: 'rejected_post',
  BILLBOARD_UPDATE: 'billboard_update',
} as const;

export type SocketEvent = typeof SocketEvents[keyof typeof SocketEvents];