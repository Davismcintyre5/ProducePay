import { Router } from 'express';
import ApiResponse from '../utils/ApiResponse.js';

const router = Router();

router.get('/healthz', (req, res) => {
  res.status(200).json(ApiResponse.success({ status: 'ok', uptime: process.uptime() }));
});

router.get('/version', (req, res) => {
  res.status(200).json(ApiResponse.success({ name: 'producepay-api', version: '1.0.0' }));
});

export default router;