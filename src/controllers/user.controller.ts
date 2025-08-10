import client from '../db/db.js';
import { Request, Response } from 'express';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await client.query(`SELECT * FROM users`);
    res.status(200).json({
      status: 'success',
      length: users.rowCount,
      data: users.rows,
    });
  } catch (err) {
    console.error('Error fetching users: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id, name, email, role } = req.body;

    const updateQuery = `
      UPDATE users
      SET name = $1, email = $2, role = $3
      WHERE id = $4
      RETURNING *`;

    const result = await client.query(updateQuery, [name, email, role, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error updating user: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};
