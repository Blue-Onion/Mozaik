import express from 'express';
import { register, login, logout, getMe } from '#controllers/auth.controller.js';
import { validate } from '#middleware/validation.middleware.js';
import { registerSchema, loginSchema } from '#validations/auth.validation.js';
import { authenticate } from '#middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;

