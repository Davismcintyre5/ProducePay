import { Router } from 'express';
import { z } from 'zod';
import asyncHandler from '../utils/asyncHandler.js';
import auth from '../middleware/client/auth.js';
import rbac from '../middleware/client/rbac.js';
import validate from '../middleware/client/validate.js';
import * as controller from '../controllers/userController.js';

const phone = z.string().regex(/^(\+?254|0)\d{9}$/);

const createUserSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-z0-9_.-]+$/i),
  password: z.string().min(8).max(128),
  fullName: z.string().min(2).max(120),
  phone,
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MANAGER', 'CLERK'])
});

const updateUserSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  phone: phone.optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'CLERK']).optional()
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8).max(128)
});

const router = Router();

router.use(auth, rbac('ADMIN'));

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.get));
router.post('/', validate(createUserSchema), asyncHandler(controller.create));
router.patch('/:id', validate(updateUserSchema), asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.deactivate));
router.post('/:id/reset-password', validate(resetPasswordSchema), asyncHandler(controller.resetPassword));

export default router;