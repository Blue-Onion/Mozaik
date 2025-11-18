import express from 'express';
import { requireValidMe } from '#middleware/auth.middleware.js';
import { validate } from '#middleware/validation.middleware.js';
import { newPrompt, allPrompts, projectPrompts, onePrompt, updateStatus, updateGeneratedCode } from '#controllers/prompt.controller.js';
import { createPromptSchema, updateStatusSchema, updateGeneratedCodeSchema } from '#validations/prompt.validation.js';

const router = express.Router();
router.use(requireValidMe);

// Create a new prompt
router.post('/create', validate(createPromptSchema), newPrompt);

// Get all prompts for the authenticated user
router.get('/get-all', allPrompts);

// Get all prompts for a project
router.get('/project/:projectId', projectPrompts);

// Get a single prompt by ID
router.get('/get-one/:id', onePrompt);

// Update prompt status
router.patch('/update-status/:id', validate(updateStatusSchema), updateStatus);

// Update generated code for a prompt
router.patch('/update-code/:id', validate(updateGeneratedCodeSchema), updateGeneratedCode);

export default router;

