import { z } from 'zod';

export const createBookmarkSchema = z.object({
  name: z.string(),
  description: z.string().min(12),
  category: z.string().min(4).max(32),
  gameId: z.array(
    z.string().min(1, { message: 'game id must contains at least one id' })
  ),
});

export const gameIdBookmarkSchema = z.object({
  gameId: z.array(
    z.string().min(1, { message: 'game id must contains at least one id' })
  ),
});

export const updateBookmarkSchema = z.object({
  name: z.string(),
  description: z.string().min(12),
  category: z.string().min(4).max(32),
});
