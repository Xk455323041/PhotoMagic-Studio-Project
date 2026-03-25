import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { ApiResponse, ErrorCode } from '../types';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method
  });

  let response: ApiResponse = {
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: '服务器内部错误'
    }
  };

  // 处理特定错误类型
  if (error.name === 'ValidationError') {
    response = {
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: error.message,
        details: error.details
      }
    };
    res.status(400);
  } else if (error.message.includes('文件过大')) {
    response = {
      success: false,
      error: {
        code: ErrorCode.FILE_TOO_LARGE,
        message: '文件大小超过20MB限制'
      }
    };
    res.status(400);
  } else if (error.message.includes('不支持的文件格式')) {
    response = {
      success: false,
      error: {
        code: ErrorCode.UNSUPPORTED_FORMAT,
        message: error.message
      }
    };
    res.status(400);
  } else if (error.name === 'UnauthorizedError') {
    response = {
      success: false,
      error: {
        code: ErrorCode.AUTHENTICATION_FAILED,
        message: '认证失败'
      }
    };
    res.status(401);
  }

  res.json(response);
};
