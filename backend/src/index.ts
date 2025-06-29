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

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount API routes
app.route('/api/users', usersRoutes);

export default app;
