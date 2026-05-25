import { TRPCError } from '@trpc/server';
import type { Context } from 'hono';

// Centralized error handler
export function handleApiError(error: unknown, context?: Context) {
  // Log error details
  console.error('[API Error]', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    path: context?.req.path,
    method: context?.req.method,
  });

  // Handle TRPC errors
  if (error instanceof TRPCError) {
    return error;
  }

  // Handle database errors
  if (error instanceof Error) {
    if (error.message.includes('duplicate entry')) {
      return new TRPCError({
        code: 'CONFLICT',
        message: 'A record with this information already exists',
      });
    }

    if (error.message.includes('foreign key constraint')) {
      return new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Referenced record does not exist',
      });
    }

    if (error.message.includes('connect')) {
      return new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database connection error. Please try again later.',
      });
    }
  }

  // Default error response
  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred. Please try again later.',
  });
}

// Async error wrapper for route handlers
export function asyncHandler<T extends any[]>(
  fn: (...args: T) => Promise<any>
) {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleApiError(error, args[0] as Context);
    }
  };
}
