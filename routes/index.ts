// packages
import { Hono } from 'hono';
const router = new Hono();

// route
import authRoutes from './auth.routes';
import gameRoutes from './game.routes';
import userRoutes from './user.routes';
import bookmarkRoutes from './bookmark.routes';

// endpoint
router.route('/auth', authRoutes);
router.route('/games', gameRoutes);
router.route('/bookmark', bookmarkRoutes);
router.route('/user', userRoutes);

export default router;
