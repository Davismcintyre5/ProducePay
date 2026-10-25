import { Router } from 'express';
import multer from 'multer';
import auth from '../middleware/client/auth.js';
import rbac from '../middleware/client/rbac.js';
import asyncHandler from '../utils/asyncHandler.js';
import * as controller from '../controllers/backupController.js';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } 
});

const router = Router();

router.use(auth, rbac('ADMIN'));

router.get('/', asyncHandler(controller.list));
router.post('/create', asyncHandler(controller.create));
router.post('/restore', upload.single('backup'), asyncHandler(controller.restore));
router.post('/:id/email', asyncHandler(controller.sendToEmail));
router.delete('/:id', asyncHandler(controller.remove));

export default router;