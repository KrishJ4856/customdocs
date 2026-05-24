import 'server-only';
import { neon, NeonDbError } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing');
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });

export function isRetryableDbError(err: unknown): boolean {
  function inner(e: unknown): boolean {
    if (!e || typeof e !== 'object') return false
    if (e instanceof NeonDbError) {
      const msg = (e as any).message ?? ''
      const src = (e as any).sourceError?.message ?? ''
      return (
        msg.includes('fetch failed') ||
        msg.includes('timed out') ||
        msg.includes('ETIMEDOUT') ||
        msg.includes('Error connecting to database') ||
        src.includes('fetch failed') ||
        src.includes('AggregateError')
      )
    }
    if (e instanceof Error) {
      if (inner((e as any).cause)) return true
      const msg = e.message ?? ''
      if (
        msg.includes('fetch failed') ||
        msg.includes('timed out') ||
        msg.includes('ETIMEDOUT') ||
        msg.includes('Error connecting to database') ||
        msg.includes('AggregateError')
      ) return true
    }
    return false
  }
  return inner(err)
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

export * from './schema';
