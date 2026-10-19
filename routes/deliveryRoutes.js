import { Router } from 'express';
import { z } from 'zod';
import asyncHandler from '../utils/asyncHandler.js';
import auth from '../middleware/client/auth.js';
import rbac from '../middleware/client/rbac.js';
import validate from '../middleware/client/validate.js';
import * as controller from '../controllers/deliveryController.js';

const createDeliverySchema = z.object({
  farmerId: z.string().regex(/^[a-f0-9]{24}$/i),
  weightKg: z.number().min(0.1).max(100000),
  collectedAt: z.string().datetime().optional(),
  clientRequestId: z.string().min(8).max(64).optional(),
  notes: z.string().max(500).optional()
});

const updateDeliverySchema = z.object({
  weightKg: z.number().min(0.1).max(100000).optional(),
  collectedAt: z.string().datetime().optional(),
  notes: z.string().max(500).optional()
});

const router = Router();

router.get('/', auth, asyncHandler(controller.list));
router.get('/:id', auth, asyncHandler(controller.get));
router.post('/', auth, rbac('CLERK', 'MANAGER', 'ADMIN'), validate(createDeliverySchema), asyncHandler(controller.create));
router.patch('/:id', auth, rbac('MANAGER', 'ADMIN'), validate(updateDeliverySchema), asyncHandler(controller.update));
router.delete('/:id', auth, rbac('ADMIN'), asyncHandler(controller.softDelete));

export default router;