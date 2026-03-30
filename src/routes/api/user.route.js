import { Router } from 'express';
import * as UserController from '../../controllers/user.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { uploadAvatar, handleUploadError } from '../../middleware/upload.middleware.js';

const router = Router();

router.get('/', UserController.getAll);
router.get('/username/:username', UserController.getByUsername);
router.get('/:id', UserController.getById);
router.put('/:id', authenticate, UserController.update);
router.delete('/:id', authenticate, UserController.remove);
router.post('/:id/avatar', authenticate, uploadAvatar, handleUploadError, UserController.uploadAvatar);

export default router;
