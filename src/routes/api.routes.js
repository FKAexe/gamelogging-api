import { Router } from 'express';
import authRoutes from './api/auth.routes.js';
import userRoutes from './api/user.route.js';
import friendsRoutes from './api/friends.route.js';
import gamesRoutes from './api/games.routes.js';
import libraryRoutes from './api/library.routes.js';
import logsRoutes from './api/logs.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/friends', friendsRoutes);
router.use('/games', gamesRoutes);
router.use('/library', libraryRoutes);
router.use('/logs', logsRoutes);

export default router;
