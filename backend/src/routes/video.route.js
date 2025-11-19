import express from 'express';
import { requireValidMe } from '#middleware/auth.middleware.js';
import { validate } from '#middleware/validation.middleware.js';
import { generateVideo, getVideoById } from '#controllers/video.controller.js';
import { generateVideoSchema } from '#validations/video.validation.js';

const router = express.Router();
router.use(requireValidMe);

// Generate video from Manim code
router.post('/generate', validate(generateVideoSchema), generateVideo);

// Get video by ID
router.get('/:id', getVideoById);

export default router;

