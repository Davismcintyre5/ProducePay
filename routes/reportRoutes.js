import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import auth from '../middleware/client/auth.js';
import rbac from '../middleware/client/rbac.js';
import * as controller from '../controllers/reportController.js';

const router = Router();

router.get('/dashboard', auth, asyncHandler(controller.dashboard));
router.get('/weekly', auth, rbac('MANAGER', 'ADMIN'), asyncHandler(controller.weekly));
router.get('/farmer/:id', auth, asyncHandler(controller.farmerSummary));
router.get('/export.csv', auth, rbac('MANAGER', 'ADMIN'), asyncHandler(controller.exportCsv));

export default router;