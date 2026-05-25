import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient && env.redisUrl) {
    redisClient = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('error', (err) => {
      logger.error({ error: err.message }, 'Redis connection error');
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });
  }

  return redisClient || (new Redis() as Redis);
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const cached = await client.get(key);
    return cached ? JSON.parse(cached) as T : null;
  } catch (error) {
    logger.error({ error, key }, 'Cache get error');
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
  try {
    const client = getRedisClient();
    await client.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    logger.error({ error, key }, 'Cache set error');
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    logger.error({ error, key }, 'Cache delete error');
  }
}

export async function cacheDeletePattern(pattern: string): Promise<void> {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    logger.error({ error, pattern }, 'Cache delete pattern error');
  }
}

export async function cacheIncrement(key: string, by: number = 1): Promise<number> {
  try {
    const client = getRedisClient();
    return await client.incrby(key, by);
  } catch (error) {
    logger.error({ error, key }, 'Cache increment error');
    return 0;
  }
}
