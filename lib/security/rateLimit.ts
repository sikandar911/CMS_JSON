/**
 * Rate Limiting utility using Upstash Redis
 * Protects API endpoints from abuse
 * Gracefully falls back to no-op if Upstash not configured (local dev)
 */

let rateLimiter: any = null
let isConfigured = false
let redisClient: any = null
// In-memory fallback for local development/testing
const inMemoryMap: Map<string, { count: number; windowStart: number; banUntil: number }> = new Map()

// Try to initialize Upstash rate limiter (production only)
try {
  const { Ratelimit } = require('@upstash/ratelimit')
  const { Redis } = require('@upstash/redis')

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (upstashUrl && upstashToken) {
    const redis = new Redis({
      url: upstashUrl,
      token: upstashToken,
    })

    // store redis client for ban keys and other operations
    redisClient = redis 

    // Create rate limiter with sliding window algorithm (default)
    rateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60 s'), // Default: 10 requests per 60 seconds
      analytics: true,
      prefix: 'cms_ratelimit',
    })

    isConfigured = true
    console.log('✓ Upstash rate limiter initialized')
  } else {
    console.log('⚠ Upstash not configured - rate limiting disabled (OK for local dev)')
  }
} catch (err) {
  console.warn('⚠ Rate limiter not available:', err instanceof Error ? err.message : err)
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  pending: Promise<unknown>
  // optional ban info
  banned?: boolean
  banTTL?: number // seconds remaining for ban
}

/**
 * Check rate limit for a given identifier
 * @param identifier - Unique key (e.g., IP address, user ID, route:ip)
 * @param limit - Maximum requests allowed
 * @param window - Time window in seconds
 * @returns Rate limit result
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60,
  banMinutes: number = 30
): Promise<RateLimitResult> {
  // If rate limiter not configured (local dev), allow all requests
  if (!isConfigured || !rateLimiter) {
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + window * 1000,
      pending: Promise.resolve(),
    }
  }

  try {
    // NOTE: checkRateLimit is a convenience helper that checks current status
    // without necessarily consuming a token. For login flows we prefer to
    // check ban status first (isBanned) and consume a token only after a
    // failed authentication (consumeRateLimit) so that remaining attempts
    // decrement only on failed credentials.

    // If Redis is available, check ban key
    if (redisClient) {
      const banKey = `ban:${identifier}`
      const ttl = await redisClient.ttl(banKey)
      if (typeof ttl === 'number' && ttl > 0) {
        return {
          success: false,
          limit,
          remaining: 0,
          reset: Date.now() + ttl * 1000,
          pending: Promise.resolve(),
          banned: true,
          banTTL: ttl,
        }
      }
      // We can't reliably peek Upstash remaining tokens without consuming,
      // so return a permissive positive response (caller may choose to consume)
      return {
        success: true,
        limit,
        remaining: limit,
        reset: Date.now() + window * 1000,
        pending: Promise.resolve(),
      }
    }

    // Fallback: in-memory limiter for local dev/testing
    const now = Date.now()
    const state = inMemoryMap.get(identifier) || { count: 0, windowStart: now, banUntil: 0 }
    if (state.banUntil > now) {
      const ttl = Math.ceil((state.banUntil - now) / 1000)
      return {
        success: false,
        limit,
        remaining: 0,
        reset: Date.now() + ttl * 1000,
        pending: Promise.resolve(),
        banned: true,
        banTTL: ttl,
      }
    }

    // If window expired, reset counters (but do not consume here)
    if (now - state.windowStart > window * 1000) {
      state.count = 0
      state.windowStart = now
      inMemoryMap.set(identifier, state)
    }

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - state.count),
      reset: Date.now() + window * 1000,
      pending: Promise.resolve(),
    }
  } catch (error) {
    // On error, fail open (allow request) to avoid breaking functionality
    console.error('Rate limit check error:', error)
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + window * 1000,
      pending: Promise.resolve(),
    }
  }
}

/**
 * Create a custom rate limiter for specific limits
 * @param requestsPerWindow - Number of requests allowed
 * @param windowSeconds - Time window in seconds
 */
export function createRateLimiter(requestsPerWindow: number, windowSeconds: number) {
  if (!isConfigured || !rateLimiter) {
    return async (identifier: string) => ({
      success: true,
      limit: requestsPerWindow,
      remaining: requestsPerWindow,
      reset: Date.now() + windowSeconds * 1000,
      pending: Promise.resolve(),
    })
  }

  try {
    const { Ratelimit } = require('@upstash/ratelimit')
    const { Redis } = require('@upstash/redis')

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requestsPerWindow, `${windowSeconds} s`),
      analytics: true,
      prefix: 'cms_ratelimit',
    })

    return async (identifier: string) => {
      try {
        const result = await limiter.limit(identifier)
        return {
          success: result.success,
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
          pending: result.pending,
        }
      } catch (error) {
        console.error('Rate limit error:', error)
        return {
          success: true,
          limit: requestsPerWindow,
          remaining: requestsPerWindow,
          reset: Date.now() + windowSeconds * 1000,
          pending: Promise.resolve(),
        }
      }
    }
  } catch (err) {
    return async (identifier: string) => ({
      success: true,
      limit: requestsPerWindow,
      remaining: requestsPerWindow,
      reset: Date.now() + windowSeconds * 1000,
      pending: Promise.resolve(),
    })
  }
}

/**
 * Check if identifier is currently banned (non-consuming)
 */
export async function isBanned(identifier: string): Promise<{ banned: boolean; banTTL?: number }> {
  try {
    if (redisClient) {
      const banKey = `ban:${identifier}`
      const ttl = await redisClient.ttl(banKey)
      if (typeof ttl === 'number' && ttl > 0) return { banned: true, banTTL: ttl }
      return { banned: false }
    }

    const now = Date.now()
    const state = inMemoryMap.get(identifier)
    if (state && state.banUntil > now) {
      return { banned: true, banTTL: Math.ceil((state.banUntil - now) / 1000) }
    }
    return { banned: false }
  } catch (e) {
    console.error('isBanned error:', e)
    return { banned: false }
  }
}

/**
 * Consume one token for the identifier. Returns the result including
 * remaining tokens and ban info if threshold exceeded.
 */
export async function consumeRateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60,
  banMinutes: number = 30
): Promise<RateLimitResult> {
  // If Upstash configured, use real limiter which consumes
  if (isConfigured && rateLimiter) {
    try {
      const limiterFn = createRateLimiter(limit, window)
      const result = await limiterFn(identifier)
      if (!result.success && redisClient) {
        try {
          const banKey = `ban:${identifier}`
          await redisClient.set(banKey, '1')
          await redisClient.expire(banKey, banMinutes * 60)
        } catch (e) {
          console.error('Failed to write ban key:', e)
        }
        return {
          success: false,
          limit: result.limit,
          remaining: 0,
          reset: Date.now() + banMinutes * 60 * 1000,
          pending: Promise.resolve(),
          banned: true,
          banTTL: banMinutes * 60,
        }
      }
      return result
    } catch (e) {
      console.error('consumeRateLimit error:', e)
      return { success: true, limit, remaining: limit, reset: Date.now() + window * 1000, pending: Promise.resolve() }
    }
  }

  // In-memory fallback: increment counter and ban if exceeded
  try {
    const now = Date.now()
    const state = inMemoryMap.get(identifier) || { count: 0, windowStart: now, banUntil: 0 }

    // reset window if expired
    if (now - state.windowStart > window * 1000) {
      state.count = 0
      state.windowStart = now
    }

    state.count = (state.count || 0) + 1

    if (state.count > limit) {
      state.banUntil = now + banMinutes * 60 * 1000
      inMemoryMap.set(identifier, state)
      return {
        success: false,
        limit,
        remaining: 0,
        reset: Date.now() + banMinutes * 60 * 1000,
        pending: Promise.resolve(),
        banned: true,
        banTTL: banMinutes * 60,
      }
    }

    inMemoryMap.set(identifier, state)
    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - state.count),
      reset: Date.now() + (window - Math.floor((now - state.windowStart) / 1000)) * 1000,
      pending: Promise.resolve(),
    }
  } catch (e) {
    console.error('consumeRateLimit (in-memory) error:', e)
    return { success: true, limit, remaining: limit, reset: Date.now() + window * 1000, pending: Promise.resolve() }
  }
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for production behind proxy)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  const ip = cfConnectingIp || forwarded?.split(',')[0] || realIp || 'anonymous'
  
  return ip.trim()
}
