import app from './app.js';
import { config } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDatabase } from './config/db.js';

const startServer = async () => {
  try {
    // Attempt database connection
    await connectDatabase();

    const server = app.listen(config.port, () => {
      logger.info(`=========================================`);
      logger.info(`🚀 CloudVault API running in ${config.nodeEnv} mode`);
      logger.info(`📡 Server listening on http://localhost:${config.port}`);
      logger.info(`🔍 Health check: http://localhost:${config.port}/api/health`);
      logger.info(`=========================================`);
    });

    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
