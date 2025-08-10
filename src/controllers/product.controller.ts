import client from '../db/db.js';
import { Request, Response } from 'express';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const query = `
    SELECT products.id, products.name, products.price, products.stock, 
    categories.name AS category_name, categories.description AS category_description
    FROM products
    LEFT JOIN categories ON products.category_id = categories.id
    `;
    const products = await client.query(query);
    res.status(200).json({
      status: 'success',
      length: products.rowCount,
      data: products.rows,
    });
  } catch (err) {
    console.error('Error fetching products: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, stock, category_id } = req.body;
    const query = `INSERT INTO products (name, price, stock, category_id) VALUES($1, $2, $3, $4) RETURNING *`;

    const newProduct = await client.query(query, [
      name,
      price,
      stock,
      category_id,
    ]);
    res.status(201).json({
      status: 'success',
      data: newProduct.rows[0],
    });
  } catch (err: any) {
    console.error('Error creating product: ', err);
    if (err.message.includes('duplicate')) {
      res
        .status(400)
        .json({ status: 'fail', message: 'Product already exists' });
    } else if (err.message.includes('constraint')) {
      res.status(400).json({ status: 'fail', message: 'Invalid category id' });
    } else {
      res
        .status(500)
        .json({ status: 'fail', message: 'Internal server error' });
    }
  }
};

export const getProduct = async (req: Request, res: Response) => {
  const productId = +req.params.id;
  if (!productId) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'A valid product ID is required' });
  }

  try {
    const query = `SELECT products.id, products.name, products.price, products.stock, categories.name AS category_name, categories.description AS category_description
    FROM products
    LEFT JOIN categories ON products.category_id = categories.id
    WHERE products.id = $1`;
    const product = await client.query(query, [productId]);

    if (product.rowCount === 0) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Product not found' });
    }

    res.status(200).json({
      status: 'success',
      data: product.rows[0],
    });
  } catch (err) {
    console.error('Error fetching product: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const id = +req.params.id;
  if (!id) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'A valid product ID is required' });
  }
  try {
    const { name, price, stock, category_id } = req.body;

    const query = `
      UPDATE products
      SET name = $1, price = $2, stock = $3, category_id = $4
      WHERE id = $5
      RETURNING *
    `;
    const updatedProduct = await client.query(query, [
      name,
      price,
      stock,
      category_id,
      id,
    ]);

    if (updatedProduct.rowCount === 0) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Product not found' });
    }

    res.status(200).json({
      status: 'success',
      data: updatedProduct.rows[0],
    });
  } catch (err: any) {
    if (err.message.includes('duplicate')) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Product already exists' });
    }
    if (err.message.includes('constraint')) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Invalid category id' });
    }
    console.error('Error updating product: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const id = +req.params.id;
  if (!id) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'A valid product ID is required' });
  }
  try {
    const query = `DELETE FROM products WHERE id = $1`;
    const result = await client.query(query, [id]);
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Product not found' });
    }
    res
      .status(204)
      .json({ status: 'success', message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};
