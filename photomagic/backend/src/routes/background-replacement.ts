import express from 'express';
import { processBackgroundReplacement } from '../services/backgroundReplacementService';
import { ApiResponse, BackgroundReplacementParams } from '../types';
import logger from '../config/logger';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { foreground_file_id, background_file_id, parameters } = req.body;
    
    if (!foreground_file_id || !background_file_id) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少必要参数: foreground_file_id 和 background_file_id'
        }
      };
      return res.status(400).json(response);
    }

    logger.info('Received background replacement request', {
      foregroundFileId: foreground_file_id,
      backgroundFileId: background_file_id,
      parameters
    });

    const result = await processBackgroundReplacement(
      foreground_file_id,
      background_file_id,
      parameters as BackgroundReplacementParams
    );

    const response: ApiResponse = {
      success: true,
      data: {
        result_id: result.resultId,
        url: result.url,
        expires_at: result.expiresAt,
        processing_time: result.metadata.processingTime,
        metadata: {
          foreground_dimensions: {
            width: 800,
            height: 1200
          },
          background_dimensions: {
            width: 1920,
            height: 1080
          },
          result_dimensions: result.metadata.dimensions
        }
      }
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
