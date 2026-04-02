import express from 'express';
import { ApiResponse, IDPhotoParams } from '../types';
import { processIDPhotoWithVeLMagicX } from '../services/idPhotoProxyService';
import logger from '../config/logger';

const router = express.Router();

router.post('/', async (req, res, next) => {
  const start = Date.now();

  try {
    const { image_base64, parameters } = req.body;

    if (!image_base64) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少必要参数: image_base64',
        },
      };
      return res.status(400).json(response);
    }

    logger.info('Received internal ID photo proxy request', {
      hasParameters: !!parameters,
      parameterKeys: parameters ? Object.keys(parameters) : [],
      imageBase64Length: typeof image_base64 === 'string' ? image_base64.length : 0,
    });

    const result = await processIDPhotoWithVeLMagicX(
      image_base64,
      (parameters || {}) as IDPhotoParams
    );

    const duration = Date.now() - start;

    logger.info('Internal ID photo proxy request completed', {
      resultId: result.resultId,
      url: result.url,
      layoutUrl: result.layoutUrl,
      durationMs: duration,
    });

    const response: ApiResponse = {
      success: true,
      data: {
        result_id: result.resultId,
        url: result.url,
        layout_url: result.layoutUrl,
        expires_at: result.expiresAt,
        processing_time: result.metadata.processingTime,
        format: result.metadata.format || 'png',
      },
    };

    res.json(response);
  } catch (err: any) {
    logger.error('Internal ID photo proxy request failed', {
      error: err?.message || 'Unknown error',
      stack: err?.stack || null,
      durationMs: Date.now() - start,
    });
    next(err);
  }
});

export default router;
