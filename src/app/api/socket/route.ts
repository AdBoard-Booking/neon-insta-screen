import { NextRequest } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as ServerIO } from 'socket.io';
import { initSocket } from '@/lib/socket-server';
import { setSocketIO } from '@/lib/socket-io';

let io: ServerIO | null = null;

export async function GET(req: NextRequest) {
  if (!io) {
    const httpServer = new NetServer();
    io = initSocket(httpServer);
    setSocketIO(io);
  }

  return new Response('Socket.IO server initialized', { status: 200 });
}