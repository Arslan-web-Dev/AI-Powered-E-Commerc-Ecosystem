import { cacheGet, cacheSet, cacheIncrement } from '../lib/cache';

// Simple in-memory rate limiter as fallback
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

// Rate limiter using Redis or in-memory fallback
async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  try {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Try Redis first
    const cached = await cacheGet<{ count: number; resetTime: number }>(key);
    
    if (cached) {
      if (cached.resetTime < now) {
        // Window expired, reset
        await cacheSet(key, { count: 1, resetTime: now + config.windowMs }, config.windowMs / 1000);
        return { success: true, remaining: config.max - 1, resetTime: now + config.windowMs };
      }

      if (cached.count >= config.max) {
        return { success: false, remaining: 0, resetTime: cached.resetTime };
      }

      const newCount = await cacheIncrement(key);
      return { success: true, remaining: config.max - newCount, resetTime: cached.resetTime };
    }

    // Initialize new window
    await cacheSet(key, { count: 1, resetTime: now + config.windowMs }, config.windowMs / 1000);
    return { success: true, remaining: config.max - 1, resetTime: now + config.windowMs };
  } catch {
    // Fallback to in-memory
    const stored = inMemoryStore.get(identifier);
    const now = Date.now();

    if (!stored || stored.resetTime < now) {
      inMemoryStore.set(identifier, { count: 1, resetTime: now + config.windowMs });
      return { success: true, remaining: config.max - 1, resetTime: now + config.windowMs };
    }

    if (stored.count >= config.max) {
      return { success: false, remaining: 0, resetTime: stored.resetTime };
    }

    stored.count++;
    return { success: true, remaining: config.max - stored.count, resetTime: stored.resetTime };
  }
}

// Rate limiter configurations
export const rateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
};

export const authRateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
};

export const mutationRateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 20,
};

export const publicRateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
};

// Rate limiter middleware function
export async function rateLimit(identifier: string, config: RateLimitConfig = rateLimitConfig) {
  return await checkRateLimit(identifier, config);
}
