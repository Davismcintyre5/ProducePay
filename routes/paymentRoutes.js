import { Router } from 'express';
import { z } from 'zod';
import asyncHandler from '../utils/asyncHandler.js';
import auth from '../middleware/client/auth.js';
import rbac from '../middleware/client/rbac.js';
import validate from '../middleware/client/validate.js';
import * as controller from '../controllers/paymentController.js';

const markPaidSchema = z.object({
  method: z.enum(['MPESA', 'CASH', 'BANK']),
  reference: z.string().min(2).max(64)
});

const cancelPaymentSchema = z.object({
  reason: z.string().min(2).max(300)
});

const router = Router();

router.get('/', auth, asyncHandler(controller.list));
router.get('/:id', auth, asyncHandler(controller.get));
router.get('/:id/receipt.pdf', auth, asyncHandler(controller.receipt));
router.post('/:id/mark-paid', auth, rbac('MANAGER', 'ADMIN'), validate(markPaidSchema), asyncHandler(controller.markPaid));
router.post('/:id/cancel', auth, rbac('ADMIN'), validate(cancelPaymentSchema), asyncHandler(controller.cancel));

export default router;