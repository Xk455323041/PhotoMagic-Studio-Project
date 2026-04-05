import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import env from './config/env';
import logger from './config/logger';
import backgroundRemovalRouter from './routes/background-removal';
import idPhotoRouter from './routes/id-photo';
import backgroundReplacementRouter from './routes/background-replacement';
import photoRestorationRouter from './routes/photo-restoration';
import healthRouter from './routes/health';
import uploadRouter from './routes/upload';
import resultsRouter from './routes/results';
import internalIdPhotoRouter from './routes/internal-id-photo';
import idPhotoTasksRouter from './routes/id-photo-tasks';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app = express();
app.set('trust proxy', 1);
const PORT = env.port || 3000;

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: env.corsOrigin,
  credentials: true
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制100个请求
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: '请求过于频繁，请稍后再试'
    }
  }
});

const disableRateLimit = process.env.DISABLE_RATE_LIMIT === '1';
if (!disableRateLimit) {
  app.use(limiter);
} else {
  logger.warn('Rate limit middleware disabled via DISABLE_RATE_LIMIT=1');
}

// 解析中间件
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 请求日志
app.use(requestLogger);

// 暴露临时结果目录，供 Pages/外部代理回拉处理结果
app.use('/temp', express.static(path.join(process.cwd(), 'temp')));

// API路由
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/background-removal', backgroundRemovalRouter);
app.use('/api/v1/id-photo', idPhotoRouter);
app.use('/api/v1/id-photo/tasks', idPhotoTasksRouter);
app.use('/api/v1/background-replacement', backgroundReplacementRouter);
app.use('/api/v1/photo-restoration', photoRestorationRouter);
app.use('/api/v1/results', resultsRouter);
app.use('/api/v1/internal/id-photo', internalIdPhotoRouter);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '接口不存在'
    }
  });
});

// 全局错误处理
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  logger.info(`🚀 PhotoMagic Backend Service running on port ${PORT}`);
  logger.info(`📊 Environment: ${env.nodeEnv}`);
  logger.info(`🔗 API Base: http://localhost:${PORT}/api/v1`);
});
