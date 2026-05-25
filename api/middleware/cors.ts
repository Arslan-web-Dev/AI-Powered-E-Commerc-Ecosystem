import { env } from '../lib/env';

// CORS configuration
export const corsConfig = {
  origin: (origin: string | null) => {
    const allowedOrigins = env.allowedOrigins?.split(',') || ['http://localhost:3000'];
    if (!origin) return true;
    return allowedOrigins.includes(origin);
  },
  credentials: true,
  maxAge: 86400,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposeHeaders: ['Content-Length', 'Content-Type'],
};

// CORS headers helper
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = corsConfig.origin(origin);
  return {
    'Access-Control-Allow-Origin': allowedOrigin ? (origin || '*') : '',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': corsConfig.allowMethods.join(', '),
    'Access-Control-Allow-Headers': corsConfig.allowHeaders.join(', '),
    'Access-Control-Expose-Headers': corsConfig.exposeHeaders.join(', '),
    'Access-Control-Max-Age': corsConfig.maxAge.toString(),
  };
}
