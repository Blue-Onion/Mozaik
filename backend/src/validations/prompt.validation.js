import { z } from 'zod';

export const createPromptSchema = z.object({
  text: z.string().min(1, 'Prompt text is required'),
  projectId: z.string().uuid('Invalid project ID').optional().nullable(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'GENERATING_CODE', 'RENDERING_VIDEO', 'COMPLETED', 'FAILED'], {
    errorMap: () => ({ message: 'Status must be PENDING, GENERATING_CODE, RENDERING_VIDEO, COMPLETED, or FAILED' }),
  }),
});

export const updateGeneratedCodeSchema = z.object({
  generatedCode: z.string().min(1, 'Generated code is required'),
});

