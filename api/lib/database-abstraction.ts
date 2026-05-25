import { getDb as getMySQLDb } from '../queries/connection';
import { getSupabaseClient } from './supabase';
import { getMongoDb as getMongoDb } from './mongodb';
import { env } from './env';
import { logger } from './logger';

export enum DatabaseType {
  MYSQL = 'mysql',
  SUPABASE = 'supabase',
  MONGODB = 'mongodb',
}

export interface DatabaseConfig {
  type: DatabaseType;
  priority: number; // Lower number = higher priority
}

// Database priority configuration
const databaseConfigs: DatabaseConfig[] = [
  { type: DatabaseType.MYSQL, priority: 1 }, // Primary database
  { type: DatabaseType.SUPABASE, priority: 2 }, // Backup/Analytics
  { type: DatabaseType.MONGODB, priority: 3 }, // Cache/Logs
];

export class DatabaseManager {
  private activeDatabases: Map<DatabaseType, boolean> = new Map();

  constructor() {
    // Initialize database status
    databaseConfigs.forEach(config => {
      this.activeDatabases.set(config.type, false);
    });
  }

  async initialize(): Promise<void> {
    try {
      // Initialize MySQL
      if (env.databaseUrl) {
        await getMySQLDb();
        this.activeDatabases.set(DatabaseType.MYSQL, true);
        logger.info('MySQL database initialized');
      }

      // Initialize Supabase
      if (env.supabaseUrl && env.supabaseKey) {
        getSupabaseClient();
        this.activeDatabases.set(DatabaseType.SUPABASE, true);
        logger.info('Supabase database initialized');
      }

      // Initialize MongoDB
      if (env.mongoUrl) {
        await getMongoDb();
        this.activeDatabases.set(DatabaseType.MONGODB, true);
        logger.info('MongoDB database initialized');
      }

      logger.info('Database manager initialized successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize databases');
      throw error;
    }
  }

  isAvailable(type: DatabaseType): boolean {
    return this.activeDatabases.get(type) || false;
  }

  getPrimaryDatabase(): DatabaseType {
    for (const config of databaseConfigs) {
      if (this.isAvailable(config.type)) {
        return config.type;
      }
    }
    throw new Error('No database available');
  }

  getAvailableDatabases(): DatabaseType[] {
    return databaseConfigs
      .filter(config => this.isAvailable(config.type))
      .map(config => config.type);
  }

  async healthCheck(): Promise<Record<DatabaseType, boolean>> {
    const health: Record<DatabaseType, boolean> = {} as Record<DatabaseType, boolean>;

    // Check MySQL
    try {
      const db = getMySQLDb();
      await db.execute(sql`SELECT 1`);
      health[DatabaseType.MYSQL] = true;
    } catch {
      health[DatabaseType.MYSQL] = false;
    }

    // Check Supabase
    try {
      const client = getSupabaseClient();
      await client.from('users').select('id').limit(1);
      health[DatabaseType.SUPABASE] = true;
    } catch {
      health[DatabaseType.SUPABASE] = false;
    }

    // Check MongoDB
    try {
      const db = await getMongoDb();
      await db.admin().ping();
      health[DatabaseType.MONGODB] = true;
    } catch {
      health[DatabaseType.MONGODB] = false;
    }

    return health;
  }
}

// Singleton instance
export const dbManager = new DatabaseManager();
