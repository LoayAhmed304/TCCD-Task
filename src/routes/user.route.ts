import express from 'express';

import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { getUsers, updateUser } from '../controllers/user.controller.js';
const router = express.Router();

router.get('/', protect, restrictTo('admin'), getUsers);
router.patch('/', protect, restrictTo('admin'), updateUser);

export default router;
