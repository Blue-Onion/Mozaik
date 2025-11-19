import express from 'express';
import { requireValidMe } from '#middleware/auth.middleware.js';
import { validate } from '#middleware/validation.middleware.js';
import { generateCode, debugCode } from '#controllers/code.controller.js';
import { generateCodeSchema, debugCodeSchema } from '#validations/code.validation.js';

const router = express.Router();
router.use(requireValidMe);

// Generate manim code by analyzing last 10 prompts in a project
router.post('/generate-code', validate(generateCodeSchema), generateCode);

// Debug and fix generated manim code
router.post('/debug-code', validate(debugCodeSchema), debugCode);

export default router;