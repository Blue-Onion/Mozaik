import morgan from 'morgan';
import logger from '#utils/logger.js';

// Create a stream object with a 'write' function that will be used by Morgan
const stream = {
  write: (message) => {
    // Use the 'info' log level so the output will be picked up by both transports
    logger.info(message.trim());
  },
};

// Skip all the Morgan http log if the app is running in test mode
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

// Build the morgan middleware
const morganMiddleware = morgan(
  // Define message format string (this is the default one).
  // The message format is made from tokens, and each token is
  // defined inside the Morgan library.
  // You can create your custom token to show what do you want from a request.
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  // Options: in this case, I overwrote the stream and the skip logic.
  // See the methods above.
  { stream, skip }
);

export default morganMiddleware;

