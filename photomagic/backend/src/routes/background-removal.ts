import express from 'express';
import { processBackgroundRemoval } from '../services/backgroundRemovalService';
import { ApiResponse, BackgroundRemovalParams } from '../types';
import logger from '../config/logger';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { file_id, parameters } = req.body;
    
    if (!file_id) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少必要参数: file_id'
        }
      };
      return res.status(400).json(response);
    }

    logger.info('Received background removal request', {
      fileId: file_id,
      parameters
    });

    const result = await processBackgroundRemoval(
      file_id,
      parameters as BackgroundRemovalParams
    );

    const response: ApiResponse = {
      success: true,
      data: {
        result_id: result.resultId,
        url: result.url,
        expires_at: result.expiresAt,
        processing_time: result.metadata.processingTime,
        metadata: {
          original_size: result.metadata.originalSize,
          result_size: result.metadata.resultSize,
          format: result.metadata.format,
          dimensions: result.metadata.dimensions
        }
      }
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
