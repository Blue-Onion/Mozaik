import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import startServer from './server.js';
import logger from '#utils/logger.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// Create logs directory if it doesn't exist
const logsDir = join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Start the server
try {
  startServer();
} catch (error) {
  logger.error('Failed to start server:', error);
  process.exit(1);
}

