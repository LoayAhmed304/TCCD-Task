import jwt, { JwtPayload } from 'jsonwebtoken';
import { Response, Request, NextFunction } from 'express';
import client from '../db/db.js';
interface DecodedToken extends JwtPayload {
  user: { id: string; role: string; name: string; email: string };
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error("Couldn't fetch JWT secret");

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    if (!decoded) {
      res.status(401).json({ status: 'fail', mesage: 'Invalid' });
      return;
    }
    if (!decoded.user.id) {
      res
        .status(401)
        .json({ status: 'fail', message: 'Invalid token, not userId' });

      return;
    }

    const user = await client.query(`SELECT * FROM users WHERE id = $1`, [
      decoded.user.id,
    ]);

    if (!user) {
      res.status(404).json({ status: 'fail', mesage: 'User not found' });
      req.user = undefined;
      return;
    }

    req.user = user.rows[0];
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};

export const restrictTo = (...roles: string[]) =>
  function (req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }
    const userRole = req.user.role;
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ status: 'fail', message: 'Forbidden' });
    }
    next();
  };
