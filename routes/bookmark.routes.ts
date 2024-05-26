// packages
import { Hono } from 'hono';
import { protect } from '../middlewares/auth.middleware';
import bookmarkController from '../controllers/bookmark.controller';
import { validator } from 'hono/validator';
import {
  createBookmarkSchema,
  gameIdBookmarkSchema,
  updateBookmarkSchema,
} from '../validation/bookmark.schema';
const bookmark = new Hono();

// routes
bookmark.post(
  '/link/:id',
  protect,
  validator('json', (value, c) => {
    const parsed = gameIdBookmarkSchema.safeParse(value);
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
  (c) => bookmarkController.link(c)
);
bookmark.post(
  '/unlink/:id',
  protect,
  validator('json', (value, c) => {
    const parsed = gameIdBookmarkSchema.safeParse(value);
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
  (c) => bookmarkController.unlink(c)
);

bookmark.post(
  '/',
  protect,
  validator('json', (value, c) => {
    const parsed = createBookmarkSchema.safeParse(value);
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
  (c) => bookmarkController.create(c)
);
bookmark.put(
  '/:id',
  protect,
  validator('json', (value, c) => {
    const parsed = updateBookmarkSchema.safeParse(value);
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
  (c) => bookmarkController.update(c)
);

bookmark.delete('/:id', protect, (c) => bookmarkController.delete(c));
bookmark.get('/', protect, (c) => bookmarkController.index(c));
bookmark.get('/:id', protect, (c) => bookmarkController.show(c));

export default bookmark;
