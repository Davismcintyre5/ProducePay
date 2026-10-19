import { Router } from 'express';
import { z } from 'zod';
import asyncHandler from '../utils/asyncHandler.js';
import auth from '../middleware/client/auth.js';
import rbac from '../middleware/client/rbac.js';
import validate from '../middleware/client/validate.js';
import * as controller from '../controllers/settingsController.js';

const updateSettingsSchema = z.object({
  organisation: z
    .object({
      orgName: z.string().min(2).max(200).optional(),
      shortName: z.string().min(2).max(40).optional(),
      phone: z.string().max(20).optional(),
      email: z.string().email().max(254).optional().or(z.literal('')),
      physicalAddress: z.string().max(200).optional(),
      postalAddress: z.string().max(200).optional()
    })
    .optional(),
  business: z
    .object({
      ratePerKg: z.number().min(0).max(10000).optional(),
      currency: z.string().min(1).max(8).optional(),
      weightUnit: z.string().min(1).max(8).optional(),
      minDeliveryWeightKg: z.number().min(0).max(1000).optional(),
      maxDeliveryWeightKg: z.number().min(1).max(1000000).optional()
    })
    .optional(),
  notifications: z
    .object({
      emailEnabled: z.boolean().optional(),
      smsEnabled: z.boolean().optional(),
      notifyFarmerOnDelivery: z.boolean().optional(),
      notifyFarmerOnPayment: z.boolean().optional(),
      notifyManagersOnWeeklyReport: z.boolean().optional(),
      weeklyReportDay: z.number().int().min(0).max(6).optional(),
      weeklyReportHour: z.number().int().min(0).max(23).optional()
    })
    .optional(),
  receipts: z
    .object({
      prefix: z.string().min(1).max(8).optional(),
      footerNote: z.string().max(300).optional()
    })
    .optional()
});

const router = Router();

router.use(auth);

router.get('/', asyncHandler(controller.get));
router.patch(
  '/',
  rbac('ADMIN'),
  validate(updateSettingsSchema),
  asyncHandler(controller.update)
);
router.post('/reset', rbac('ADMIN'), asyncHandler(controller.reset));

export default router;