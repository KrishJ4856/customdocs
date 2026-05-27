import 'server-only'
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is missing')
}

let cached = (globalThis as any).__mongoose

if (!cached) {
  cached = (globalThis as any).__mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      bufferCommands: true,
      maxPoolSize: 10,
    }).then((m) => m)
  }

  cached.conn = await cached.promise
  return cached.conn
}

export { connectDB }

export function isRetryableDbError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const e = err as any
  const msg = e.message ?? e.reason?.message ?? ''
  return (
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('timed out') ||
    msg.includes('MongooseServerSelectionError') ||
    msg.includes('connect ETIMEDOUT') ||
    msg.includes('topology was destroyed') ||
    msg.includes('not connected')
  )
}

export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1500): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i >= retries - 1 || !isRetryableDbError(err)) throw err
      await new Promise(r => setTimeout(r, delayMs * (i + 1)))
    }
  }
}

export * from './models'
export * from './queries'
