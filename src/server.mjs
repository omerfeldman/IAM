import app from './index.mjs';
import { initConfig } from "./utils/config.mjs";
import { Logger } from "./utils/logger.mjs";
import { connectDB } from './DB/DBConnection.mjs';

const config = initConfig();

connectDB()
  .then(() => {
    const server = app.listen(config.port, () => {
      Logger.info(`Server running on port ${config.port}`);
    });

    process.on('SIGINT', () => {
      Logger.info("Gracefully shutting down from SIGINT (Ctrl-C)");
      server.close(() => {
        Logger.info("Closed out remaining connections");
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    Logger.error('Failed to connect to the database:', err);
    process.exit(1);
  });
