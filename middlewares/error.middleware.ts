import type { Context } from 'hono';

// error 500 handler
export const errorHandler = (c: Context) => {
  return c.json({
    status: false,
    message: c.error?.message,
    stack: process.env.NODE_ENV === 'production' ? null : c.error?.stack,
  });
};

// error not found
export const notFoundHandler = (c: Context) => {
  return c.json(
    {
      status: false,
      message: `Not Found - [${c.req.method}] ${c.req.url}`,
      data: null,
    },
    404
  );
};
