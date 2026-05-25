import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateEnv } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { cachePublic, noStore } from './middleware/cacheMiddleware.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import {
  mongoSanitizeMiddleware,
  sanitizeRequest
} from './middleware/securityMiddleware.js';
import adminRoutes from './routes/adminRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import publicCommentRoutes from './routes/publicCommentRoutes.js';
import publicPostRoutes from './routes/publicPostRoutes.js';

dotenv.config();
validateEnv();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...configuredOrigins, 'http://localhost:5173'];

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production'
        ? {
            directives: {
              defaultSrc: ["'self'"],
              baseUri: ["'self'"],
              fontSrc: ["'self'", 'https://fonts.gstatic.com'],
              imgSrc: ["'self'", 'data:', 'https:'],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              connectSrc: ["'self'", process.env.CLIENT_URL].filter(Boolean)
            }
          }
        : false
  })
);
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);
app.use(apiLimiter);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(mongoSanitizeMiddleware);
app.use(sanitizeRequest);
app.use('/uploads', cachePublic(60 * 60 * 24 * 7), express.static(path.join(__dirname, 'uploads')));

import publicContactRoutes from './routes/publicContactRoutes.js';

app.use('/api', healthRoutes);
app.use('/api/admin', noStore, adminRoutes);
app.use('/api/posts', publicPostRoutes);
app.use('/api/comments', publicCommentRoutes);
app.use('/api/contact', publicContactRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
