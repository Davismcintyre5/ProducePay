import { Router } from 'express';
import { z } from 'zod';
import asyncHandler from '../utils/asyncHandler.js';
import auth from '../middleware/client/auth.js';
import rbac from '../middleware/client/rbac.js';
import validate from '../middleware/client/validate.js';
import * as controller from '../controllers/farmerController.js';

const phone = z.string().regex(/^(\+?254|0)\d{9}$/);

const createFarmerSchema = z.object({
  name: z.string().min(2).max(120),
  phone,
  email: z.string().email().optional(),
  idNumber: z.string().min(4).max(20).optional(),
  location: z.string().min(2).max(120),
  farmSizeAcres: z.number().min(0).max(10000).optional(),
  notes: z.string().max(500).optional()
});

const updateFarmerSchema = createFarmerSchema.partial();

const router = Router();

router.get('/', auth, asyncHandler(controller.list));
router.get('/:id', auth, asyncHandler(controller.get));
router.get('/:id/statement', auth, asyncHandler(controller.statement));
router.post('/', auth, rbac('MANAGER', 'ADMIN'), validate(createFarmerSchema), asyncHandler(controller.create));
router.patch('/:id', auth, rbac('MANAGER', 'ADMIN'), validate(updateFarmerSchema), asyncHandler(controller.update));
router.delete('/:id', auth, rbac('ADMIN'), asyncHandler(controller.softDelete));

export default router;