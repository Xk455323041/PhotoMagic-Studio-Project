import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import env from './config/env';
import logger from './config/logger';
import backgroundRemovalRouter from './routes/background-removal';
import idPhotoRouter from './routes/id-photo';
import backgroundReplacementRouter from './routes/background-replacement';
import photoRestorationRouter from './routes/photo-restoration';
import healthRouter from './routes/health';
import uploadRouter from './routes/upload';
import resultsRouter from './routes/results';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app = express();
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
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: '请求过于频繁，请稍后再试'
    }
  }
});
app.use(limiter);

// 解析中间件
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 请求日志
app.use(requestLogger);



// API路由
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/background-removal', backgroundRemovalRouter);
app.use('/api/v1/id-photo', idPhotoRouter);
app.use('/api/v1/background-replacement', backgroundReplacementRouter);
app.use('/api/v1/photo-restoration', photoRestorationRouter);
app.use('/api/v1/results', resultsRouter);

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
