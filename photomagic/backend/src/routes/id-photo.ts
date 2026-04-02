import express from 'express';
import { processIDPhoto } from '../services/idPhotoService';
import { ApiResponse, IDPhotoParams } from '../types';
import logger from '../config/logger';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { file_id } = req.body;
    const parameters = (req.body?.parameters || {}) as IDPhotoParams;
    
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

    logger.info('Received ID photo request', {
      fileId: file_id,
      parameters
    });

    const result = await processIDPhoto(
      file_id,
      parameters as IDPhotoParams
    );

    const response: ApiResponse = {
      success: true,
      data: {
        result_id: result.resultId,
        url: result.url,
        layout_url: result.layoutUrl,
        expires_at: result.expiresAt,
        processing_time: result.metadata.processingTime,
        metadata: {
          size: parameters.size?.type || '大一寸',
          dimensions_mm: {
            width: 33,
            height: 48
          },
          dimensions_px: result.metadata.dimensions,
          layout: parameters.output?.layout || 'single',
          copies: parameters.output?.layout === '4x6' ? 8 : 1
        }
      }
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
