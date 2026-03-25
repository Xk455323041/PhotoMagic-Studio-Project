import express from 'express';
import { processPhotoRestoration } from '../services/photoRestorationService';
import { ApiResponse, OldPhotoRestorationParams } from '../types';
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

    logger.info('Received photo restoration request', {
      fileId: file_id,
      parameters
    });

    const result = await processPhotoRestoration(
      file_id,
      parameters as OldPhotoRestorationParams
    );

    const response: ApiResponse = {
      success: true,
      data: {
        result_id: result.resultId,
        url: result.url,
        animation_url: result.animationUrl,
        comparison_url: result.comparisonUrl,
        expires_at: result.expiresAt,
        processing_time: result.metadata.processingTime,
        metadata: {
          original_dimensions: {
            width: 400,
            height: 600
          },
          enhanced_dimensions: result.metadata.dimensions,
          colorized: parameters.colorization?.enabled || false,
          animation_duration: parameters.animation?.animation_duration || 0,
          format: result.metadata.format
        }
      }
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
