import pino from 'pino';
import { env } from './env';

export const logger = pino({
  level: env.logLevel,
  transport: env.nodeEnv === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  } : undefined,
  base: {
    env: env.nodeEnv,
  },
});

export function logApiError(error: unknown, context: { path?: string; method?: string; userId?: number }) {
  logger.error({
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  }, 'API Error');
}

export function logAudit(action: string, entity: string, entityId: number, userId?: number, details?: any) {
  logger.info({
    action,
    entity,
    entityId,
    userId,
    details,
  }, 'Audit Log');
}
