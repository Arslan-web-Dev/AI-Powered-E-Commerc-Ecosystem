import { env } from '../lib/env';

// CSRF token generation and validation
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  // Simple validation - in production, use cryptographic validation
  return token === sessionToken;
}

export const csrfConfig = {
  allowedOrigins: env.allowedOrigins?.split(',') || ['http://localhost:3000'],
};
