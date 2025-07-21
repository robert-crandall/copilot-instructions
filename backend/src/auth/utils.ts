import bcrypt from 'bcryptjs'
import { sign, verify } from 'hono/jwt'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createJWT(userId: string, rememberMe: boolean = false): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + (rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24) // 30 days or 1 day
  
  return sign({
    userId,
    exp
  }, process.env.JWT_SECRET!)
}

export async function verifyJWT(token: string): Promise<{ userId: string } | null> {
  try {
    const payload = await verify(token, process.env.JWT_SECRET!)
    return { userId: payload.userId as string }
  } catch {
    return null
  }
}
