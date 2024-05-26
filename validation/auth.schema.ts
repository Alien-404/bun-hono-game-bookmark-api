import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(8).max(32),
  name: z.string(),
  password: z.string().min(8),
  gender: z.boolean(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
