import express from 'express';
import logger from '#config/logger';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '#routes/auth.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.get('/', (req, res) => {
  logger.info('Received request for Acquisitions home page');
  res.status(200).send('Hello from Acquisitions!');
});

app.get('/health', (req, res) => {
  logger.info('Received request for health check');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime()});
});

app.get('/api', (req, res) => {
  logger.info('Received request for API home page');
  res.status(200).json({ message: 'Welcome to the Acquisitions API', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);

export default app;
