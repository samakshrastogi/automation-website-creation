import express from 'express';
import {
  getVercelConfig,
  exchangeVercelCode,
  verifyVercelToken,
  createDeployment,
  getDeploymentStatus,
} from '../controllers/vercelController.js';

const router = express.Router();

router.get('/config', getVercelConfig);
router.post('/oauth-exchange', exchangeVercelCode);
router.post('/verify', verifyVercelToken);
router.post('/deploy', createDeployment);
router.get('/deployment/:id', getDeploymentStatus);

export default router;
