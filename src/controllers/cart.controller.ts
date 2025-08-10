import client from '../db/db.js';
import { Request, Response } from 'express';

export const createCart = async (req: Request, res: Response) => {
  try {
    const query = `INSERT INTO carts (user_id) VALUES ($1) RETURNING *`;
    const userId = req.user?.id;

    const newCart = await client.query(query, [userId]);

    res.status(201).json({
      status: 'success',
      data: newCart.rows[0],
    });
  } catch (err: any) {
    if (err.message.includes('duplicate')) {
      return res
        .status(409)
        .json({ status: 'fail', message: 'Cart already exists' });
    }
    console.error('Error creating cart: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};

export const deleteCart = async (req: Request, res: Response) => {
  try {
    const deleteCartQuery = `DELETE FROM carts WHERE user_id = $1`;
    const result = await client.query(deleteCartQuery, [req.user?.id]);
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ status: 'fail', message: "User doesn't have a cart" });
    }
    res
      .status(204)
      .json({ status: 'success', message: 'Cart deleted successfully' });
  } catch (err) {
    console.error('Error deleting cart: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};
