import express from 'express';

import { protect } from '../middlewares/auth.middleware.js';
import { createCart, deleteCart } from '../controllers/cart.controller.js';
import { getAllCartItems } from '../controllers/cartitem.controller.js';

const router = express.Router();

router.use(protect);

router.get('/:id', getAllCartItems);
router.post('/', createCart);
router.delete('/', deleteCart);

export default router;
