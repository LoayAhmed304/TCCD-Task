import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import productsRouter from './routes/product.route.js';
import categoriesRouter from './routes/category.route.js';
dotenv.config();
const app: express.Application = express();

app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/categories', categoriesRouter);
const PORT = process.env.PORT || 3000;

app.use((req: express.Request, res: express.Response) => {
  const msg: string = `cannot find ${req.originalUrl}`;
  res.status(404).json({ status: 'fail', message: msg });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
