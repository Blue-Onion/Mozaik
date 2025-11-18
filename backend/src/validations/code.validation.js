import { z } from 'zod';

export const generateCodeSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
});

