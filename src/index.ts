import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

const app: express.Application = express();

app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(morgan('dev'));

const PORT = process.env.PORT || 3000;

app.use((req: express.Request, res: express.Response) => {
  const msg: string = `cannot find ${req.originalUrl}`;
  res.status(404).json({ status: 'fail', message: msg });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
