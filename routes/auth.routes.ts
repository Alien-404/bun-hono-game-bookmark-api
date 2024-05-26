// packages
import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { loginSchema, registerSchema } from '../validation/auth.schema';

const auth = new Hono();
import authController from '../controllers/auth.controller';

// routes
auth.post(
  '/register',
  validator('json', (value, c) => {
    const parsed = registerSchema.safeParse(value);
    if (!parsed.success) {
      return c.json(
        {
          status: false,
          message: parsed.error.formErrors,
          data: null,
        },
        400
      );
    }
    return parsed.data;
  }),
  async (c) => authController.register(c)
);

auth.post(
  '/login',
  validator('json', (value, c) => {
    const parsed = loginSchema.safeParse(value);
    if (!parsed.success) {
      return c.json(
        {
          status: false,
          message: parsed.error.formErrors,
          data: null,
        },
        400
      );
    }
    return parsed.data;
  }),
  async (c) => authController.login(c)
);

export default auth;
