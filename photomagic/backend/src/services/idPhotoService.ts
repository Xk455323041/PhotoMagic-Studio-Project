import sharp from 'sharp';
import { IDPhotoParams, ProcessingResult } from '../types';
import { getFilePath, saveProcessingResult } from './fileService';
import logger from '../config/logger';

/**
 * 证件照制作服务
 * 模拟实现，实际项目中需要接入人像分割AI模型
 */
export async function processIDPhoto(
  fileId: string,
  params: IDPhotoParams = {}
): Promise<ProcessingResult> {
  const startTime = Date.now();
  
  try {
    logger.info('Starting ID photo processing', { fileId, params });
    
    // 获取文件路径
    const filePath = await getFilePath(fileId);
    
    // 默认参数
    const defaultParams: IDPhotoParams = {
      photo_type: 'id_card',
      background: {
        type: 'solid',
        color: '#ffffff'
      },
      size: {
        type: '大一寸',
        dpi: 300
      },
      portrait: {
        position: 'center',
        zoom: 1.0,
        beauty: {
          enabled: true,
          skin_smooth: 30,
          eye_brighten: 20,
          teeth_whiten: 15
        }
      },
      output: {
        format: 'jpg',
        quality: 90,
        layout: 'single'
      }
    };
    
    const mergedParams = { ...defaultParams, ...params };

    // 尺寸映射（mm转像素，300dpi）
    const sizeMap = {
      '大一寸': { width: 33, height: 48 },
      '小一寸': { width: 22, height: 32 },
      '大两寸': { width: 35, height: 45 },
      '小两寸': { width: 35, height: 45 },
      '标准一寸': { width: 25, height: 35 },
      '标准两寸': { width: 35, height: 49 }
    };

    // 获取目标尺寸
    let targetSizeMm;
    if (mergedParams.size?.type === 'custom' && mergedParams.size.width_mm && mergedParams.size.height_mm) {
      targetSizeMm = {
        width: mergedParams.size.width_mm,
        height: mergedParams.size.height_mm
      };
    } else {
      const sizeType = mergedParams.size?.type || '大一寸';
      targetSizeMm = (sizeMap as any)[sizeType];
    }

    const dpi = mergedParams.size?.dpi || 300;
    const targetWidthPx = Math.round(targetSizeMm.width * dpi / 25.4);
    const targetHeightPx = Math.round(targetSizeMm.height * dpi / 25.4);

    // 读取原图片
    const image = sharp(filePath);
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('无法获取图片尺寸');
    }

    // 模拟人像分割（实际需要AI模型）
    // 这里简单处理，将图片缩放到目标尺寸并添加背景
    let processedImage = image
      .resize(targetWidthPx, targetHeightPx, {
        fit: 'cover',
        position: mergedParams.portrait?.position === 'center' ? 'centre' : 'top'
      });

    // 处理背景
    if (mergedParams.background?.type === 'solid' && mergedParams.background.color) {
      processedImage = processedImage.flatten({
        background: mergedParams.background.color as any
      });
    } else if (mergedParams.background?.type === 'gradient') {
      // 渐变背景处理（简化实现）
      processedImage = processedImage.flatten({
        background: mergedParams.background.gradient?.start || '#ffffff'
      });
    }

    // 生成主图
    const outputBuffer = await processedImage
      .jpeg({ quality: mergedParams.output?.quality || 90 })
      .toBuffer();

    // 生成排版版（4x6英寸相纸，包含8张一寸照片）
    let layoutBuffer: Buffer | undefined;
    if (mergedParams.output?.layout === '4x6') {
      const canvasWidth = Math.round(4 * 25.4 * dpi / 25.4); // 4英寸
      const canvasHeight = Math.round(6 * 25.4 * dpi / 25.4); // 6英寸
      
      // 创建4x6画布
      const layoutImage = sharp({
        create: {
          width: canvasWidth,
          height: canvasHeight,
          channels: 3,
          background: '#ffffff'
        }
      });

      // 计算每张照片的位置（2行4列）
      const padding = 10;
      const photoWidth = targetWidthPx;
      const photoHeight = targetHeightPx;
      const compositeArray = [];

      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 4; col++) {
          compositeArray.push({
            input: outputBuffer,
            left: col * (photoWidth + padding) + padding,
            top: row * (photoHeight + padding) + padding
          });
        }
      }

      layoutBuffer = await layoutImage
        .composite(compositeArray)
        .jpeg({ quality: 90 })
        .toBuffer();
    }

    // 保存结果
    const mainResult = await saveProcessingResult(outputBuffer, mergedParams.output?.format || 'jpg');
    
    let layoutResult;
    if (layoutBuffer) {
      layoutResult = await saveProcessingResult(layoutBuffer, 'jpg');
    }

    const processingTime = (Date.now() - startTime) / 1000;
    
    logger.info('ID photo processing completed', {
      fileId,
      resultId: mainResult.resultId,
      processingTime,
      size: targetSizeMm
    });

    const result: ProcessingResult = {
      resultId: mainResult.resultId,
      url: mainResult.url,
      expiresAt: mainResult.expiresAt,
      metadata: {
        processingTime,
        originalSize: metadata.size,
        resultSize: mainResult.size,
        format: mergedParams.output?.format || 'jpg',
        dimensions: {
          width: targetWidthPx,
          height: targetHeightPx
        }
      }
    };

    if (layoutResult) {
      result.layoutUrl = layoutResult.url;
    }

    return result;

  } catch (error) {
    logger.error('ID photo processing failed', { fileId, error });
    throw new Error('证件照制作失败');
  }
}
