import app from './app.js';
import logger from '#utils/logger.js';

const PORT = process.env.PORT || 3001;

const startServer = () => {
  const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  const gracefulShutdown = () => {
    logger.info('Shutting down gracefully...');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  return server;
};

export default startServer;

