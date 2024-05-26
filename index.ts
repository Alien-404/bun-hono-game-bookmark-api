// packages
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import router from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { cors } from 'hono/cors';
import { limitterConfig } from './config/limitter';
const app = new Hono();

// middleware
app.use(
  '*',
  logger(),
  prettyJSON(),
  // limitterConfig,
  cors({
    origin: ['http://localhost:8000'],
  })
);

// route
app.get('/', (c) => c.text('welcome to the API!'));
app.route('/v1', router);

// Error handler
app.onError((err, c) => {
  const error = errorHandler(c);
  return error;
});

// Not found handler
app.notFound((c) => {
  const error = notFoundHandler(c);
  return error;
});

// env
const PORT = Bun.env.PORT || 3000;

export default {
  port: PORT,
  fetch: app.fetch,
};
