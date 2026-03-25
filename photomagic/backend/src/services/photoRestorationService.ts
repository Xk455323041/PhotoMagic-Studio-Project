import sharp from 'sharp';
import { OldPhotoRestorationParams, ProcessingResult } from '../types';
import { getFilePath, saveProcessingResult } from './fileService';
import logger from '../config/logger';

/**
 * 老照片修复服务
 * 模拟实现，实际项目中需要接入图像修复、色彩还原、超分辨率等AI模型
 */
export async function processPhotoRestoration(
  fileId: string,
  params: OldPhotoRestorationParams = {}
): Promise<ProcessingResult> {
  const startTime = Date.now();
  
  try {
    logger.info('Starting old photo restoration', { fileId, params });
    
    // 获取文件路径
    const filePath = await getFilePath(fileId);
    
    // 默认参数
    const defaultParams: OldPhotoRestorationParams = {
      restoration_type: 'full',
      basic_repair: {
        scratch_removal: true,
        stain_removal: true,
        crease_removal: true,
        missing_parts: true,
        repair_strength: 70
      },
      colorization: {
        enabled: true,
        color_model: 'realistic',
        skin_tone: 'natural',
        environment_color: true,
        color_intensity: 80
      },
      super_resolution: {
        enabled: true,
        scale: 4,
        detail_enhancement: 60,
        noise_reduction: 50,
        sharpness: 40
      },
      face_enhancement: {
        enabled: true,
        face_restoration: true,
        expression_enhancement: true,
        age_progression: false,
        enhancement_strength: 50
      },
      animation: {
        enabled: false,
        animation_type: 'face_only',
        face_expressions: ['blink', 'smile'],
        background_motion: false,
        animation_duration: 3,
        loop: true
      },
      output: {
        format: 'jpg',
        quality: 85,
        include_original: true,
        create_comparison: true
      }
    };
    
    const mergedParams = { ...defaultParams, ...params };

    // 读取原图片
    const image = sharp(filePath);
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('无法获取图片尺寸');
    }

    // 处理流程
    let processedImage = image;

    // 1. 基础修复（划痕、污渍、折痕去除）
    if (mergedParams.basic_repair?.scratch_removal || 
        mergedParams.basic_repair?.stain_removal ||
        mergedParams.basic_repair?.crease_removal) {
      // 模拟修复：先降噪再锐化
      processedImage = processedImage
        .median(3) // 降噪
        .sharpen(); // 锐化
    }

    // 2. 超分辨率放大
    if (mergedParams.super_resolution?.enabled) {
      const scale = mergedParams.super_resolution.scale || 2;
      processedImage = processedImage.resize(
        Math.round(metadata.width * scale),
        Math.round(metadata.height * scale),
        {
          kernel: 'lanczos3' // 高质量放大
        }
      );
    }

    // 3. 色彩还原（黑白照片上色）
    if (mergedParams.colorization?.enabled) {
      // 模拟上色：调整饱和度和色彩平衡
      // 实际项目中需要AI上色模型
      processedImage = processedImage
        .modulate({
          saturation: 1.2,
          brightness: 1.1
        })
        .tint({ r: 245, g: 220, b: 200 }); // 添加暖色调
    }

    // 4. 细节增强
    if (mergedParams.super_resolution?.detail_enhancement) {
      const enhanceLevel = mergedParams.super_resolution.detail_enhancement / 100;
      processedImage = processedImage
        .sharpen({
          sigma: 1.0 + enhanceLevel,
          m1: 1.0,
          m2: 2.0
        });
    }

    // 5. 降噪处理
    if (mergedParams.super_resolution?.noise_reduction) {
      const noiseLevel = mergedParams.super_resolution.noise_reduction / 100;
      processedImage = processedImage
        .median(Math.round(1 + noiseLevel * 2));
    }

    // 生成主修复结果
    const outputBuffer = await processedImage
      .jpeg({ quality: mergedParams.output?.quality || 85 })
      .toBuffer();

    // 生成对比图（左右对比）
    let comparisonBuffer: Buffer | undefined;
    if (mergedParams.output?.create_comparison) {
      // 原图像素处理
      const originalResized = await image
        .resize(Math.round(metadata.width * (mergedParams.super_resolution?.scale || 1)))
        .jpeg({ quality: 85 })
        .toBuffer();
      
      const originalMetadata = await sharp(originalResized).metadata();
      if (!originalMetadata.width || !originalMetadata.height) {
        throw new Error('无法获取原图尺寸');
      }

      // 创建对比画布（原图在左，修复图在右）
      const comparisonWidth = originalMetadata.width * 2;
      const comparisonHeight = originalMetadata.height;
      
      const comparisonImage = sharp({
        create: {
          width: comparisonWidth,
          height: comparisonHeight,
          channels: 3,
          background: '#ffffff'
        }
      });

      comparisonBuffer = await comparisonImage
        .composite([
          {
            input: originalResized,
            left: 0,
            top: 0
          },
          {
            input: outputBuffer,
            left: originalMetadata.width,
            top: 0
          }
        ])
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    // 保存结果
    const mainResult = await saveProcessingResult(outputBuffer, mergedParams.output?.format || 'jpg');
    
    let comparisonResult;
    if (comparisonBuffer) {
      comparisonResult = await saveProcessingResult(comparisonBuffer, 'jpg');
    }

    const processingTime = (Date.now() - startTime) / 1000;
    
    logger.info('Old photo restoration completed', {
      fileId,
      resultId: mainResult.resultId,
      processingTime,
      hasComparison: !!comparisonResult
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
          width: Math.round(metadata.width * (mergedParams.super_resolution?.scale || 1)),
          height: Math.round(metadata.height * (mergedParams.super_resolution?.scale || 1))
        }
      }
    };

    if (comparisonResult) {
      result.comparisonUrl = comparisonResult.url;
    }

    return result;

  } catch (error) {
    logger.error('Old photo restoration failed', { fileId, error });
    throw new Error('老照片修复处理失败');
  }
}
