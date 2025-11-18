import { z } from 'zod';

export const createChatSchema = z.object({
  role: z.enum(['USER', 'ASSISTANT', 'SYSTEM'], {
    errorMap: () => ({ message: 'Role must be USER, ASSISTANT, or SYSTEM' }),
  }),
  content: z.string().min(1, 'Content is required'),
  projectId: z.string().uuid('Invalid project ID').optional().nullable(),
  promptId: z.string().uuid('Invalid prompt ID').optional().nullable(),
});

