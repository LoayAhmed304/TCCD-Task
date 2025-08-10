import client from '../db/db.js';
import { Request, Response } from 'express';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const query = `SELECT * FROM categories`;
    const categories = await client.query(query);
    res.status(200).json({
      status: 'success',
      length: categories.rowCount,
      data: categories.rows,
    });
  } catch (err) {
    console.error('Error fetching categories: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Name and description are required' });
    }
    const query = `INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *`;
    const newCategory = await client.query(query, [name, description]);

    res.status(201).json({
      status: 'success',
      data: newCategory.rows[0],
    });
  } catch (err: any) {
    console.error('Error creating category: ', err);
    if (err.message.includes('duplicate')) {
      res
        .status(400)
        .json({ status: 'fail', message: 'Category already exists' });
    } else {
      res
        .status(500)
        .json({ status: 'fail', message: 'Internal server error' });
    }
  }
};

export const getCategory = async (req: Request, res: Response) => {
  const categoryId = +req.params.id;
  if (!categoryId) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'A valid category ID is required' });
  }
  try {
    const query = `SELECT * FROM categories WHERE id = $1`;
    const category = await client.query(query, [categoryId]);
    if (category.rowCount === 0) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Category not found' });
    }
    res.status(200).json({
      status: 'success',
      data: category.rows[0],
    });
  } catch (err) {
    console.error('Error fetching category: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const id = +req.params.id;
  if (!id) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'A valid category ID is required' });
  }
  const { name, description } = req.body;
  if (!name || !description) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Name and description are required' });
  }
  try {
    const query = `UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *`;
    const updatedCategory = await client.query(query, [name, description, id]);
    if (updatedCategory.rowCount === 0) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Category not found' });
    }
    res.status(200).json({
      status: 'success',
      data: updatedCategory.rows[0],
    });
  } catch (err: any) {
    if (err.message.includes('duplicate')) {
      res
        .status(400)
        .json({ status: 'fail', message: 'Category already exists' });
    } else {
      console.error('Error updating category: ', err);
      res
        .status(500)
        .json({ status: 'fail', message: 'Internal server error' });
    }
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const id = +req.params.id;
  if (!id) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Please enter a valid category ID' });
  }
  try {
    const query = `DELETE FROM categories WHERE id = $1 RETURNING *`;
    const deletedCategory = await client.query(query, [id]);
    if (deletedCategory.rowCount === 0) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Category not found' });
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    console.error('Error deleting category: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};
