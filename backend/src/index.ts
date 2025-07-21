import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/bun'
import { HTTPException } from 'hono/http-exception'
import auth from './routes/auth'
import posts from './routes/posts'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: process.env.NODE_ENV === 'production' ? '*' : ['http://localhost:5173'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// API routes
app.route('/api/auth', auth)
app.route('/api/posts', posts)

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasDb: !!process.env.DATABASE_URL,
    hasJwt: !!process.env.JWT_SECRET,
    registrationEnabled: process.env.ALLOW_REGISTRATION === 'true'
  })
})

// Serve static files from frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use('/assets/*', serveStatic({ root: './dist/frontend' }))
  app.use('*', serveStatic({ path: './dist/frontend/index.html' }))
}

// Global error handler
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001

export default {
  port,
  fetch: app.fetch
}
