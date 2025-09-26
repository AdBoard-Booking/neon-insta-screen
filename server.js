const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: dev ? 'http://localhost:3000' : 'https://tulip.adboardtools.com',
      methods: ['GET', 'POST'],
    },
  });

  // Store the io instance globally so it can be accessed from API routes
  global.io = io;

  // Track active connections for monitoring
  const activeConnections = new Set();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    activeConnections.add(socket.id);
    
    // Join billboard room for real-time updates
    socket.join('billboard');
    
    // Handle client disconnect
    socket.on('disconnect', (reason) => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason);
      activeConnections.delete(socket.id);
    });

    // Handle client errors
    socket.on('error', (error) => {
      console.error('Socket error for client:', socket.id, error);
    });

    // Handle room join requests
    socket.on('join_room', (roomName) => {
      if (typeof roomName === 'string' && roomName.length > 0) {
        socket.join(roomName);
        console.log(`Client ${socket.id} joined room: ${roomName}`);
      }
    });

    // Handle room leave requests
    socket.on('leave_room', (roomName) => {
      if (typeof roomName === 'string' && roomName.length > 0) {
        socket.leave(roomName);
        console.log(`Client ${socket.id} left room: ${roomName}`);
      }
    });
  });

  // Cleanup function for graceful shutdown
  const gracefulShutdown = () => {
    console.log('Shutting down socket.io server...');
    io.close(() => {
      console.log('Socket.io server closed');
      process.exit(0);
    });
  };

  // Handle process termination signals
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  // Log connection stats periodically (optional, for monitoring)
  setInterval(() => {
    console.log(`Active connections: ${activeConnections.size}`);
  }, 30000); // Every 30 seconds

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
