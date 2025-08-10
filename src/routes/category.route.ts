import express from 'express';
import {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategory);

// admin routes
router.use(protect, restrictTo('admin'));
router.post('/', createCategory);
router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);
export default router;
