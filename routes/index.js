import { Router } from 'express';
import authRoutes from './authRoutes.js';
import farmerRoutes from './farmerRoutes.js';
import deliveryRoutes from './deliveryRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import reportRoutes from './reportRoutes.js';
import userRoutes from './userRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import publicRoutes from './publicRoutes.js';

const router = Router();

router.use('/', publicRoutes);
router.use('/auth', authRoutes);
router.use('/farmers', farmerRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);
router.use('/settings', settingsRoutes);

export default router;