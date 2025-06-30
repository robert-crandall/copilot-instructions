import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import usersRoutes from './routes/users';

// Create main app instance
const app = new Hono();

// Apply global middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:5174',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Middleware for logging and CORS
app.use('*', logger());
app.use('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Chain routes for RPC compatibility
const routes = app
  // Health check endpoints (both for backward compatibility)
  .get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  })
  .get('/api/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  })
  // Mount API routes
  .route('/api/users', usersRoutes);

// Export the app type for RPC
export type AppType = typeof routes;

export default app;
