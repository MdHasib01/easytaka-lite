import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocketUrl = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  // Default to localhost:5000 during dev if not specified
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  // In production, connect to liteapi.easytaka.com
  return 'https://liteapi.easytaka.com';
};

export const initializeWebSocket = (token: string): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  const socketUrl = getSocketUrl();
  console.log(`🔌 Initializing WebSocket connection to ${socketUrl}...`);

  socket = io(socketUrl, {
    auth: {
      token,
    },
    query: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log(`✅ [WebSocket Connected] Socket ID: ${socket?.id}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`❌ [WebSocket Disconnected] Reason: ${reason}`);
  });

  socket.on('connect_error', (error) => {
    console.warn(`⚠️ [WebSocket Connection Error]`, error.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectWebSocket = (): void => {
  if (socket) {
    console.log('🔌 Disconnecting WebSocket...');
    socket.disconnect();
    socket = null;
  }
};
