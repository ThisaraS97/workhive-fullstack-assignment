import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';
import { rateLimiter, errorMiddleware } from './middleware';
import { apiRouter } from './routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || config.corsOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
    })
  );
  app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
  app.use(rateLimiter);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/uploads', express.static(path.join(process.cwd(), config.uploadDir)));

  app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', service: 'workhive-api' } });
  });

  app.use('/api/v1', apiRouter);
  app.use(errorMiddleware);

  return app;
}
