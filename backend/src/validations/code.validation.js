import { z } from 'zod';

export const generateCodeSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
});

export const debugCodeSchema = z.object({
  code: z.string().min(1, 'Code is required and cannot be empty'),
});

