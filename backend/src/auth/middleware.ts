import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { verifyJWT } from './utils'

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Authorization token required' })
  }

  const token = authHeader.substring(7)
  const payload = await verifyJWT(token)

  if (!payload) {
    throw new HTTPException(401, { message: 'Invalid or expired token' })
  }

  c.set('userId', payload.userId)
  await next()
})
