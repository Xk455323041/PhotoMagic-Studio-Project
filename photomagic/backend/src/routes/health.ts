import express from 'express';
import logger from '../config/logger';
import env from '../config/env';

const router = express.Router();

router.get('/', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: env.nodeEnv,
    services: {
      api_gateway: {
        status: 'healthy',
        uptime: process.uptime(),
        version: '1.0.0'
      },
      background_removal: {
        status: 'healthy',
        response_time: 123,
        queue_length: 0
      },
      id_photo: {
        status: 'healthy',
        response_time: 234,
        queue_length: 0
      },
      background_replacement: {
        status: 'healthy',
        response_time: 345,
        queue_length: 0
      },
      photo_restoration: {
        status: 'healthy',
        response_time: 456,
        queue_length: 0
      }
    },
    system: {
      memory_usage: `${Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)}%`,
      cpu_usage: '12%',
      active_connections: 0
    }
  };

  res.json(healthData);
});

export default router;
