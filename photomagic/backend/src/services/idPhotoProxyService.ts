import { IDPhotoParams, ProcessingResult } from '../types';
import { saveProcessingResult } from './fileService';
import { velmagicxService } from './velmagicxService';
import logger from '../config/logger';

function mapSizeToVelmagicx(
  sizeType?: string,
  customSize?: { width_mm?: number; height_mm?: number }
): '1inch' | '2inch' | 'passport' {
  if (customSize?.width_mm && customSize?.height_mm) {
    const width = Math.min(customSize.width_mm, customSize.height_mm);
    const height = Math.max(customSize.width_mm, customSize.height_mm);

    const candidates: Array<{ name: '1inch' | '2inch' | 'passport'; width: number; height: number }> = [
      { name: '1inch', width: 25, height: 35 },
      { name: '2inch', width: 35, height: 49 },
      { name: 'passport', width: 33, height: 48 },
    ];

    candidates.sort((a, b) => {
      const da = Math.abs(a.width - width) + Math.abs(a.height - height);
      const db = Math.abs(b.width - width) + Math.abs(b.height - height);
      return da - db;
    });

    return candidates[0].name;
  }

  if (!sizeType) return '1inch';

  if (['2inch', '标准两寸', '大两寸', '小两寸'].includes(sizeType)) {
    return '2inch';
  }

  if (['passport', '护照', '护照照片'].includes(sizeType)) {
    return 'passport';
  }

  return '1inch';
}

function normalizeBackgroundColor(color?: string): string {
  if (!color || typeof color !== 'string') return '#FFFFFF';
  return color.trim() || '#FFFFFF';
}

function maskBase64Preview(input: string): string {
  if (!input) return '';
  return `${input.slice(0, 16)}...(${input.length} chars)`;
}

/**
 * 通过火山引擎 VeLMagicX 处理证件照
 */
export async function processIDPhotoWithVeLMagicX(
  imageBase64: string,
  params: IDPhotoParams = {}
): Promise<ProcessingResult> {
  const startTime = Date.now();

  try {
    logger.info('Starting VeLMagicX ID photo processing', {
      sizeType: params.size?.type,
      outputFormat: params.output?.format,
      backgroundType: params.background?.type,
      backgroundColor: params.background?.color,
      hasBeauty: !!params.portrait?.beauty?.enabled,
      inputImagePreview: maskBase64Preview(imageBase64),
    });

    const velmagicxSize = mapSizeToVelmagicx(params.size?.type, {
      width_mm: params.size?.width_mm,
      height_mm: params.size?.height_mm,
    });
    const backgroundColor = normalizeBackgroundColor(params.background?.color);
    const beautyLevel = params.portrait?.beauty?.enabled
      ? Math.min(
          1,
          Math.max(
            0,
            ((params.portrait?.beauty?.skin_smooth || 0) +
              (params.portrait?.beauty?.eye_brighten || 0) +
              (params.portrait?.beauty?.teeth_whiten || 0)) /
              300
          )
        )
      : 0;

    logger.info('Mapped VeLMagicX options', {
      velmagicxSize,
      backgroundColor,
      beautyLevel,
    });

    const outputFormat = params.output?.format || 'png';
    const requestedLayout = params.output?.layout || 'single';

    const result = await velmagicxService.idPhotoProcessing(imageBase64, {
      size: velmagicxSize,
      background_color: backgroundColor,
      beauty_level: beautyLevel,
      layout: requestedLayout,
      output_format: outputFormat,
      zoom: params.portrait?.zoom,
      composition: params.portrait?.composition,
    });

    logger.info('Raw VeLMagicX ID photo response received', {
      hasIdPhoto: !!result?.id_photo,
      hasLayoutPhoto: !!result?.layout_photo,
      complianceScore: result?.compliance_score,
    });

    if (!result?.id_photo) {
      throw new Error('VeLMagicX did not return id_photo');
    }

    const photoBuffer = Buffer.from(result.id_photo, 'base64');
    const saved = await saveProcessingResult(photoBuffer, outputFormat);

    let layoutUrl: string | undefined;
    if (result.layout_photo) {
      const layoutBuffer = Buffer.from(result.layout_photo, 'base64');
      const savedLayout = await saveProcessingResult(layoutBuffer, outputFormat);
      layoutUrl = savedLayout.url;
    }

    const processingTime = (Date.now() - startTime) / 1000;

    logger.info('VeLMagicX ID photo processing completed', {
      resultId: saved.resultId,
      resultUrl: saved.url,
      layoutUrl,
      processingTime,
      complianceScore: result.compliance_score,
      outputFormat,
      resultSize: saved.size,
    });

    return {
      resultId: saved.resultId,
      url: saved.url,
      expiresAt: saved.expiresAt,
      layoutUrl,
      metadata: {
        processingTime,
        resultSize: saved.size,
        format: outputFormat,
      },
    };
  } catch (error: any) {
    logger.error('VeLMagicX ID photo processing failed', {
      error: error?.message || 'Unknown error',
      stack: error?.stack || null,
      sizeType: params.size?.type,
      backgroundColor: params.background?.color,
      outputFormat: params.output?.format,
    });
    throw error;
  }
}
