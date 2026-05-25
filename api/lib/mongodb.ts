import { MongoClient, Db, Collection } from 'mongodb';
import { env } from './env';
import { logger } from './logger';

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (!mongoClient && env.mongoUrl) {
    mongoClient = new MongoClient(env.mongoUrl, {
      maxPoolSize: 20,
      minPoolSize: 5,
      maxIdleTimeMS: 60000,
      serverSelectionTimeoutMS: 5000,
    });

    await mongoClient.connect();
    logger.info('MongoDB connected');
  }

  if (!mongoClient) {
    throw new Error('MongoDB is not configured. Please set MONGO_URL environment variable.');
  }

  return mongoClient;
}

export async function getMongoDb(dbName: string = 'nexusai-commerce'): Promise<Db> {
  if (!mongoDb) {
    const client = await getMongoClient();
    mongoDb = client.db(dbName);
  }

  return mongoDb;
}

export async function getCollection<T>(name: string): Promise<Collection<T>> {
  const db = await getMongoDb();
  return db.collection<T>(name);
}

export async function closeMongoConnection(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    mongoDb = null;
    logger.info('MongoDB connection closed');
  }
}

// MongoDB query helpers
export async function mongoFind<T>(
  collectionName: string,
  filter: object = {},
  options: { limit?: number; skip?: number; sort?: object } = {}
): Promise<T[]> {
  try {
    const collection = await getCollection<T>(collectionName);
    const cursor = collection.find(filter);
    
    if (options.sort) {
      cursor.sort(options.sort);
    }
    
    if (options.skip) {
      cursor.skip(options.skip);
    }
    
    if (options.limit) {
      cursor.limit(options.limit);
    }
    
    return await cursor.toArray();
  } catch (error) {
    logger.error({ error, collection: collectionName }, 'MongoDB find error');
    throw error;
  }
}

export async function mongoFindOne<T>(
  collectionName: string,
  filter: object
): Promise<T | null> {
  try {
    const collection = await getCollection<T>(collectionName);
    return await collection.findOne(filter);
  } catch (error) {
    logger.error({ error, collection: collectionName }, 'MongoDB findOne error');
    throw error;
  }
}

export async function mongoInsertOne<T>(
  collectionName: string,
  document: T
): Promise<string> {
  try {
    const collection = await getCollection<T>(collectionName);
    const result = await collection.insertOne(document);
    return result.insertedId.toString();
  } catch (error) {
    logger.error({ error, collection: collectionName }, 'MongoDB insertOne error');
    throw error;
  }
}

export async function mongoUpdateOne<T>(
  collectionName: string,
  filter: object,
  update: object
): Promise<boolean> {
  try {
    const collection = await getCollection<T>(collectionName);
    const result = await collection.updateOne(filter, { $set: update });
    return result.modifiedCount > 0;
  } catch (error) {
    logger.error({ error, collection: collectionName }, 'MongoDB updateOne error');
    throw error;
  }
}

export async function mongoDeleteOne(
  collectionName: string,
  filter: object
): Promise<boolean> {
  try {
    const collection = await getCollection(collectionName);
    const result = await collection.deleteOne(filter);
    return result.deletedCount > 0;
  } catch (error) {
    logger.error({ error, collection: collectionName }, 'MongoDB deleteOne error');
    throw error;
  }
}
