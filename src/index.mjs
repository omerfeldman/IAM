import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.mjs';
import { errorHandler } from './middlewares/errorHandler.mjs';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const corsOptions = {
  origin: ['https://cloud.sightbit.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

app.get('/health', (req, res) => {
  res.send('ok');
});

app.use('/auth', authRoutes);

app.use(errorHandler);

export default app;
