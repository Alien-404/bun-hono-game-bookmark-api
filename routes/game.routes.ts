// packages
import { Hono } from 'hono';
import { protect } from '../middlewares/auth.middleware';
import gameController from '../controllers/game.controller';
const game = new Hono();

// routes
game.get('/', protect, (c) => gameController.index(c));
game.get('/:id', protect, (c) => gameController.show(c));

export default game;
