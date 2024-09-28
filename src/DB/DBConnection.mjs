import mongoose from 'mongoose';
import { initConfig } from '../utils/config.mjs';
import { Logger } from '../utils/logger.mjs';

const config = initConfig();

mongoose.connection.on('connected', () => {
  Logger.info('Connected to MongoDB via Mongoose');
});

mongoose.connection.on('error', (err) => {
  Logger.error(`Mongoose connection error: ${err}`);
});

export async function connectDB() {
  try {
    await mongoose.connect(config.connectionString);
  } catch (err) {
    Logger.error(`Error connecting to MongoDB: ${err}`);
    throw err;
  }
}