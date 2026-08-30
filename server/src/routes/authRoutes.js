import express from 'express';
import {
  getGitHubConfig,
  exchangeGitHubCode,
} from '../controllers/authController.js';

const router = express.Router();

router.get('/github/config', getGitHubConfig);
router.post('/github/oauth-exchange', exchangeGitHubCode);

export default router;
