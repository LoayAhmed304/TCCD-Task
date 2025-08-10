import express from 'express';

import { protect } from '../middlewares/auth.middleware.js';

import {
  createCartItem,
  getCartItem,
  updateCartItem,
} from '../controllers/cartitem.controller.js';
const router = express.Router();

router.use(protect);
router.post('/:id', createCartItem);
router.get('/:id', getCartItem);
router.patch('/:id', updateCartItem);
export default router;
