import sharp from 'sharp';
import { BackgroundRemovalParams, ProcessingResult } from '../types';
import { getFilePath, saveProcessingResult } from './fileService';
import logger from '../config/logger';
import axios from 'axios';
import env from '../config/env';
import fs from 'fs';

/**
 * 背景移除服务
 * 目前使用模拟实现，实际使用时可以接入Remove.bg API或本地AI模型
 */
export async function processBackgroundRemoval(
  fileId: string,
  params: BackgroundRemovalParams = {}
): Promise<ProcessingResult> {
  const startTime = Date.now();
  
  try {
    logger.info('Starting background removal', { fileId, params });
    
    // 获取文件路径
    const filePath = await getFilePath(fileId);
    
    // 默认参数
    const defaultParams: BackgroundRemovalParams = {
      size: 'auto',
      format: 'png',
      bg_color: 'transparent',
      edge_smoothness: 'auto',
      hair_detail: true,
      shadow: false
    };
    
    const mergedParams = { ...defaultParams, ...params };

    // 模拟AI处理（实际项目中这里调用真实的AI模型或API）
    // 这里我们用sharp做简单的处理作为示例
    let image = sharp(filePath);
    const metadata = await image.metadata();
    
    // 简单的阈值分割模拟背景移除（仅作示例，实际需要AI模型）
    const { data, info } = await image
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // 创建透明度通道
    const rgbaData = Buffer.alloc(info.width * info.height * 4);
    for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // 简单的白色/浅色背景检测
      const brightness = (r + g + b) / 3;
      const isBackground = brightness > 240; // 阈值可调整
      
      rgbaData[j] = r;
      rgbaData[j + 1] = g;
      rgbaData[j + 2] = b;
      rgbaData[j + 3] = isBackground ? 0 : 255; // 背景透明
    }

    // 处理背景颜色
    let processedImage = sharp(rgbaData, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    });

    // 如果不是透明背景，添加背景色
    if (mergedParams.bg_color !== 'transparent') {
      processedImage = processedImage.flatten({
        background: mergedParams.bg_color as any
      });
    }

    // 边缘平滑处理
    if (mergedParams.edge_smoothness !== 'low') {
      processedImage = processedImage.blur(mergedParams.edge_smoothness === 'high' ? 1 : 0.5);
    }

    // 生成结果
    let outputBuffer: Buffer;
    let format = mergedParams.format || 'png';
    
    if (format === 'jpg') {
      outputBuffer = await processedImage
        .jpeg({ quality: 90 })
        .toBuffer();
    } else if (format === 'webp') {
      outputBuffer = await processedImage
        .webp({ quality: 90 })
        .toBuffer();
    } else {
      outputBuffer = await processedImage
        .png({ quality: 90 })
        .toBuffer();
    }

    // 保存结果
    const result = await saveProcessingResult(outputBuffer, format);
    
    const processingTime = (Date.now() - startTime) / 1000;
    
    logger.info('Background removal completed', {
      fileId,
      resultId: result.resultId,
      processingTime,
      size: result.size
    });

    return {
      resultId: result.resultId,
      url: result.url,
      expiresAt: result.expiresAt,
      metadata: {
        processingTime,
        originalSize: metadata.size,
        resultSize: result.size,
        format,
        dimensions: {
          width: info.width,
          height: info.height
        }
      }
    };

  } catch (error) {
    logger.error('Background removal failed', { fileId, error });
    throw new Error('背景移除处理失败');
  }
}

/**
 * 调用Remove.bg API实现背景移除（真实实现）
 */
async function removeBgWithAPI(
  filePath: string,
  params: BackgroundRemovalParams
): Promise<Buffer> {
  if (!env.removeBgApiKey) {
    throw new Error('Remove.bg API key not configured');
  }

  const formData = new FormData();
  formData.append('image_file', fs.createReadStream(filePath));
  formData.append('size', params.size || 'auto');
  formData.append('format', params.format || 'png');
  
  if (params.bg_color !== 'transparent') {
    formData.append('bg_color', params.bg_color);
  }

  const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
    headers: {
      'X-Api-Key': env.removeBgApiKey,
      ...(formData as any).getHeaders()
    },
    responseType: 'arraybuffer'
  });

  return response.data;
}
