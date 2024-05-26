// packages
import { Hono } from 'hono';
const user = new Hono();
import userController from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

// routes
user.get('/whoami', protect, (c) => userController.profile(c));

export default user;
