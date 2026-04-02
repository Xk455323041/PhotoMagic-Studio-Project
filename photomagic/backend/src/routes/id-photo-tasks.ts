import express from 'express';
import { createIDPhotoTask, getIDPhotoTask } from '../services/idPhotoTaskService';
import { ApiResponse, IDPhotoParams } from '../types';
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

    logger.info('Received async ID photo task request', {
      fileId: file_id,
      hasParameters: !!parameters,
      parameterKeys: parameters ? Object.keys(parameters) : []
    });

    const task = await createIDPhotoTask(file_id, (parameters || {}) as IDPhotoParams);

    const response: ApiResponse = {
      success: true,
      data: {
        task_id: task.taskId,
        status: task.status,
        file_id: task.fileId,
        created_at: task.createdAt
      }
    };

    return res.status(202).json(response);
  } catch (err) {
    next(err);
  }
});

router.get('/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = getIDPhotoTask(taskId);

    if (!task) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '任务不存在'
        }
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: task.status !== 'failed',
      data: {
        task_id: task.taskId,
        file_id: task.fileId,
        status: task.status,
        created_at: task.createdAt,
        started_at: task.startedAt,
        completed_at: task.completedAt,
        result: task.result
          ? {
              result_id: task.result.resultId,
              url: task.result.url,
              layout_url: task.result.layoutUrl,
              expires_at: task.result.expiresAt,
              processing_time: task.result.metadata.processingTime,
              metadata: task.result.metadata,
            }
          : undefined,
        error: task.error,
      }
    };

    return res.status(task.status === 'failed' ? 500 : 200).json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
