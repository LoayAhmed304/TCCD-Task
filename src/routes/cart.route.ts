import express from 'express';

import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { createCart, deleteCart } from '../controllers/cart.controller.js';
import {
  getAllCartItems,
  getMyCartItems,
} from '../controllers/cartitem.controller.js';

const router = express.Router();

router.use(protect);

router.get('/:id', restrictTo('admin'), getAllCartItems);
router.get('/', getMyCartItems);
router.post('/', createCart);
router.delete('/', deleteCart);

export default router;
