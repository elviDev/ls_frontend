// Use local WebSocket server in development, Railway in production
export const WS_URL = process.env.NODE_ENV === 'production' 
  ? "https://lsbackend-production-46d9.up.railway.app"
  : "http://localhost:3001";
