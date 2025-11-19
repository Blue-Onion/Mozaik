import { z } from 'zod';

export const generateVideoSchema = z.object({
  code: z.string().min(1, 'Code is required and cannot be empty'),
  promptId: z.string().uuid('Invalid prompt ID').optional().nullable(),
  projectId: z.string().uuid('Invalid project ID').optional().nullable(),
});

