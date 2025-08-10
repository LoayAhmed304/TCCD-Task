import express from 'express';

import {
  signup,
  login,
  checkAuth,
  logout,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/check', protect, checkAuth);
router.post('/logout', logout);
export default router;
