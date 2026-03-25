import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { FileMetadata } from '../types';
import logger from '../config/logger';
import fs from 'fs/promises';
import path from 'path';

// 临时文件存储目录
const TEMP_DIR = path.join(process.cwd(), 'temp');

// 确保临时目录存在
fs.mkdir(TEMP_DIR, { recursive: true }).catch(err => {
  logger.error('Failed to create temp directory', err);
});

/**
 * 保存上传的文件到临时存储
 */
export async function saveUploadedFile(
  file: Express.Multer.File
): Promise<FileMetadata> {
  const fileId = `file_${randomUUID().replace(/-/g, '')}`;
  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${fileId}${ext}`;
  const filePath = path.join(TEMP_DIR, filename);

  // 保存文件
  await fs.writeFile(filePath, file.buffer);

  // 获取图片元数据
  const metadata = await sharp(file.buffer).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error('无法获取图片尺寸');
  }

  // 生成临时URL（这里简化处理，实际应该用云存储）
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24小时后过期
  const url = `/temp/${filename}`;

  return {
    fileId,
    filename: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
    dimensions: {
      width: metadata.width,
      height: metadata.height
    },
    url,
    expiresAt
  };
}

/**
 * 根据fileId获取文件路径
 */
export async function getFilePath(fileId: string): Promise<string> {
  const files = await fs.readdir(TEMP_DIR);
  const file = files.find(f => f.startsWith(fileId));
  if (!file) {
    throw new Error('文件不存在');
  }
  return path.join(TEMP_DIR, file);
}

/**
 * 保存处理结果
 */
export async function saveProcessingResult(
  buffer: Buffer,
  format: string = 'png'
): Promise<{ resultId: string; url: string; expiresAt: string; size: number }> {
  const resultId = `result_${randomUUID().replace(/-/g, '')}`;
  const filename = `${resultId}.${format}`;
  const filePath = path.join(TEMP_DIR, filename);

  await fs.writeFile(filePath, buffer);

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const url = `/temp/${filename}`;

  return {
    resultId,
    url,
    expiresAt,
    size: buffer.length
  };
}

/**
 * 清理过期文件
 */
export async function cleanupExpiredFiles(): Promise<void> {
  try {
    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stats = await fs.stat(filePath);
      if (stats.mtime.getTime() < oneDayAgo) {
        await fs.unlink(filePath);
        logger.info('Cleaned up expired file', { file });
      }
    }
  } catch (err) {
    logger.error('Failed to cleanup expired files', err);
  }
}

// 每小时清理一次过期文件
setInterval(cleanupExpiredFiles, 60 * 60 * 1000);
