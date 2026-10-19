import { Router } from 'express';
import { z } from 'zod';
import asyncHandler from '../utils/asyncHandler.js';
import validate from '../middleware/client/validate.js';
import auth from '../middleware/client/auth.js';
import { loginLimiter } from '../middleware/global/rateLimit.js';
import * as controller from '../controllers/authController.js';

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128)
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128)
});

const requestResetSchema = z.object({
  email: z.string().email().max(254)
});

const verifyResetSchema = z.object({
  email: z.string().email().max(254),
  otp: z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(8).max(128)
});

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(controller.login));
router.post('/refresh', asyncHandler(controller.refresh));
router.post('/logout', auth, asyncHandler(controller.logout));
router.get('/me', auth, asyncHandler(controller.me));
router.patch('/me/password', auth, validate(changePasswordSchema), asyncHandler(controller.changePassword));
router.post('/request-reset', loginLimiter, validate(requestResetSchema), asyncHandler(controller.requestReset));
router.post('/verify-reset', loginLimiter, validate(verifyResetSchema), asyncHandler(controller.verifyReset));

export default router;