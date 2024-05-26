import { rateLimiter } from 'hono-rate-limiter';

export const limitterConfig = rateLimiter({
  windowMs: 1 * 60 * 1000,
  limit: 500,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => 'b679da09cda2',
  message: {
    status: false,
    message: 'to many request from this IP, try again later.',
    data: null,
  },
});
