import { Router } from 'express';
import * as LibraryController from '../../controllers/library.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, LibraryController.getMyLibrary);
router.get('/user/:userId', LibraryController.getUserLibrary);
router.post('/', authenticate, LibraryController.addGame);
router.delete('/:gameId', authenticate, LibraryController.removeGame);
router.get ('/game/:gameId/exists', LibraryController.isGameInUserLibrary);

export default router;
