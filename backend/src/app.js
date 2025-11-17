import express from 'express';
import cors from 'cors';
import helmetMiddleware from '#middleware/helmet.js';
import cookieParser from 'cookie-parser';
import morganMiddleware from '#middleware/morgan.js';
import logger from '#utils/logger.js';
import authRoutes from '#routes/auth.route.js';
import codeRoutes from '#routes/code.route.js';
const app = express();

// Security middleware (Helmet)
app.use(helmetMiddleware);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP request logging middleware (Morgan)
app.use(morganMiddleware);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/code', codeRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
});

export default app;

