import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';
import { logger } from './logger';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient && env.supabaseUrl && env.supabaseKey) {
    supabaseClient = createClient(env.supabaseUrl, env.supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    logger.info('Supabase client initialized');
  }

  if (!supabaseClient) {
    throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_KEY environment variables.');
  }

  return supabaseClient;
}

// Supabase query helpers
export async function supabaseQuery<T>(
  table: string,
  query: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>
): Promise<T> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await query(client);

    if (error) {
      logger.error({ error, table }, 'Supabase query error');
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from Supabase');
    }

    return data;
  } catch (error) {
    logger.error({ error, table }, 'Supabase query error');
    throw error;
  }
}
