import { Logger } from '../utils/logger.mjs';

export function errorHandler(err, req, res, next) {
  Logger.error(`Error: ${err.message}`);
  res.status(500).json({ message: 'Internal Server Error' });
}
