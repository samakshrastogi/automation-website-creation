import express from 'express';
import {
  getGitHubConfig,
  exchangeGitHubCode,
  startDeviceFlow,
  pollDeviceToken,
} from '../controllers/authController.js';

const router = express.Router();

router.get('/github/config', getGitHubConfig);
router.post('/github/oauth-exchange', exchangeGitHubCode);
router.post('/github/device-code', startDeviceFlow);
router.post('/github/device-poll', pollDeviceToken);

export default router;
