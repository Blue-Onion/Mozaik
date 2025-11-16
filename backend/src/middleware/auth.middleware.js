import { verifyToken } from '#services/auth.service.js';
import { getUserById } from '#services/auth.service.js';
import logger from '#utils/logger.js';

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: 'Invalid or expired token',
      });
    }

    // Get user from database
    const user = await getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      error: 'Authentication failed',
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : req.cookies?.token;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        const user = await getUserById(decoded.userId);
        if (user) {
          req.user = user;
        }
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

