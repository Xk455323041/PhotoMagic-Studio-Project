import express from 'express';
import multer from 'multer';
import { saveUploadedFile } from '../services/fileService';
import { ApiResponse } from '../types';
import logger from '../config/logger';

const router = express.Router();

// 文件上传配置
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB限制
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/bmp',
      'image/tiff'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件格式，仅支持 JPG, PNG, WebP, BMP, TIFF'));
    }
  }
});

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '请上传文件'
        }
      };
      return res.status(400).json(response);
    }

    const { type, purpose } = req.body;
    if (!type || !purpose) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '缺少必要参数: type 和 purpose'
        }
      };
      return res.status(400).json(response);
    }

    logger.info('Processing file upload', {
      filename: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      type,
      purpose
    });

    const fileMetadata = await saveUploadedFile(req.file);

    const response: ApiResponse = {
      success: true,
      data: {
        file_id: fileMetadata.fileId,
        url: fileMetadata.url,
        expires_at: fileMetadata.expiresAt,
        metadata: {
          filename: fileMetadata.filename,
          size: fileMetadata.size,
          mime_type: fileMetadata.mimeType,
          dimensions: fileMetadata.dimensions
        }
      }
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
