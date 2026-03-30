import { Router } from 'express';
import * as GameLogController from '../../controllers/gamelog.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, GameLogController.getMyLogs);
router.get('/user/:userId', GameLogController.getUserLogs);
router.get('/game/:gameId', GameLogController.getGameLogs);
router.get('/pending', authenticate, GameLogController.getPendingParticipations);

router.post('/', authenticate, GameLogController.create);
router.put('/:id', authenticate, GameLogController.update);
router.delete('/:id', authenticate, GameLogController.remove);

router.put('/participant/:id/accept', authenticate, GameLogController.acceptParticipation);
router.put('/participant/:id/reject', authenticate, GameLogController.rejectParticipation);

export default router;
