import { MongoClient } from 'mongodb';
import { mongo } from './config';
import { logger } from './logger';

let client: MongoClient | null = null;

export const connect = async () => {
  if (client) return client;
  client = new MongoClient(mongo.uri);
  await client.connect();
  logger.info('Connected to MongoDB');
  return client;
}

export const getDb = () => {
  if (!client) throw new Error('Mongo client not connected');
  return client.db(mongo.dbName);
}

export const close = async () => {
  if (!client) return;
  await client.close();
  client = null;
  logger.info('MongoDB connection closed');
}

export const ping = async () => {
  try {
    const c = await connect();
    // run a simple command
    await c.db(mongo.dbName).command({ ping: 1 });
    return true;
  } catch (e:any) {
    logger.error('Mongo ping failed', e.message || e);
    return false;
  }
}
