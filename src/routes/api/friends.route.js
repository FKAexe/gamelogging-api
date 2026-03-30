import { Router } from 'express';
import * as FriendsController from '../../controllers/friends.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, FriendsController.getFriends);
router.get('/pending', authenticate, FriendsController.getPendingRequests);
router.get('/sent', authenticate, FriendsController.getSentRequests);

router.post('/request/:friendId', authenticate, FriendsController.sendRequest);
router.put('/accept/:requestId', authenticate, FriendsController.acceptRequest);
router.put('/reject/:requestId', authenticate, FriendsController.rejectRequest);
router.delete('/remove/:friendId', authenticate, FriendsController.removeFriend);
router.delete('/cancel/:requestId', authenticate, FriendsController.cancelRequest);

export default router;
