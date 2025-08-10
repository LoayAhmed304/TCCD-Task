import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import client from '../db/db.js';
import { generateToken } from '../lib/utils.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, role, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: 'fail', message: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password is too short. Must be at least 6 characters long.',
      });
    }

    const emailExists = await client.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    if (emailExists.rows.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email is already in use',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const insertQuery = `INSERT INTO users (name, email, role, password) VALUES ($1, $2, $3, $4) RETURNING *`;

    // save user to db
    const result = await client.query(insertQuery, [
      name,
      email,
      role,
      hashedPassword,
    ]);

    generateToken(result.rows[0], res);

    res.status(201).json({
      status: 'success',
      message: 'Signup successful',
      data: { email: result.rows[0].email, name: result.rows[0].name },
    });
  } catch (err) {
    console.error('Error signing up: ', err);

    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Email and password are required' });
  }
  try {
    const userQuery = `SELECT * FROM users WHERE email ILIKE $1`;

    const result = await client.query(userQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }

    generateToken(user, res);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: { email: user.email, name: user.name },
    });
  } catch (err) {
    console.error('Error logging in: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    res.clearCookie('jwt');
    return res.status(200).json({
      status: 'success',
      message: 'Logout successful',
    });
  } catch (err) {
    console.error('Error logging out: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};

export const checkAuth = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized access',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Authorized access',
      data: { userId },
    });
  } catch (err) {
    console.error('Error checking auth: ', err);
    res.status(500).json({ status: 'fail', message: 'Internal server error' });
  }
};
