// Simple in-memory rate limiter
// Can be swapped for Redis-backed solution in production if needed

const store = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

async function check(
  identifier: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    store.set(identifier, { count: 1, resetAt: now + config.windowMs });
    return { success: true, remaining: config.max - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.max) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: config.max - entry.count, resetAt: entry.resetAt };
}

export const rateLimitConfig: RateLimitConfig        = { windowMs: 15 * 60 * 1000, max: 100 };
export const authRateLimitConfig: RateLimitConfig    = { windowMs: 15 * 60 * 1000, max: 5 };
export const mutationRateLimitConfig: RateLimitConfig = { windowMs: 60 * 1000,     max: 20 };
export const publicRateLimitConfig: RateLimitConfig  = { windowMs: 15 * 60 * 1000, max: 200 };

export async function rateLimit(identifier: string, config: RateLimitConfig = rateLimitConfig) {
  return check(identifier, config);
}
