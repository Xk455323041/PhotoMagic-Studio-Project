import { IDPhotoParams, ProcessingResult } from '../types';
import { saveProcessingResult } from './fileService';
import { velmagicxService } from './velmagicxService';
import logger from '../config/logger';

type FallbackPreset = 'id_card_standard' | 'passport_standard' | 'tight_headshot' | 'loose_headshot';

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

function getNormalizedSizeMm(params: IDPhotoParams): { width: number; height: number } | null {
  if (params.size?.width_mm && params.size?.height_mm) {
    return {
      width: Math.min(params.size.width_mm, params.size.height_mm),
      height: Math.max(params.size.width_mm, params.size.height_mm),
    };
  }

  const namedSizeMap: Record<string, { width: number; height: number }> = {
    '小一寸': { width: 22, height: 32 },
    '标准一寸': { width: 25, height: 35 },
    '大一寸': { width: 33, height: 48 },
    '小两寸': { width: 35, height: 45 },
    '大两寸': { width: 35, height: 45 },
    '标准两寸': { width: 35, height: 49 },
    passport: { width: 33, height: 48 },
    '护照': { width: 33, height: 48 },
    '护照照片': { width: 33, height: 48 },
  };

  const named = params.size?.type ? namedSizeMap[params.size.type] : undefined;
  return named ? { ...named } : null;
}

function inferCompositionPreset(
  params: IDPhotoParams,
  velmagicxSize: '1inch' | '2inch' | 'passport'
): { preset: FallbackPreset; reason: string } {
  const normalizedSize = getNormalizedSizeMm(params);
  const width = normalizedSize?.width;
  const height = normalizedSize?.height;
  const sizeType = params.size?.type;

  if (params.photo_type === 'passport') {
    return { preset: 'passport_standard', reason: 'photo_type=passport' };
  }

  if (params.photo_type === 'visa') {
    return { preset: 'passport_standard', reason: 'photo_type=visa' };
  }

  if (params.photo_type === 'driver_license') {
    return { preset: 'tight_headshot', reason: 'photo_type=driver_license' };
  }

  if (sizeType && ['passport', '护照', '护照照片'].includes(sizeType)) {
    return { preset: 'passport_standard', reason: `size.type=${sizeType}` };
  }

  if (typeof width === 'number' && typeof height === 'number') {
    if (Math.abs(width - 33) <= 1 && Math.abs(height - 48) <= 1) {
      return {
        preset: params.photo_type === 'custom' ? 'passport_standard' : 'id_card_standard',
        reason: `custom_size≈33x48 photo_type=${params.photo_type || 'id_card'}`,
      };
    }

    if (width >= 35 && height >= 45) {
      return { preset: 'tight_headshot', reason: `custom_size_large=${width}x${height}` };
    }

    if (width <= 25 && height <= 35) {
      return { preset: 'loose_headshot', reason: `custom_size_small=${width}x${height}` };
    }
  }

  if (sizeType && ['标准两寸', '大两寸', '小两寸', '2inch'].includes(sizeType)) {
    return { preset: 'tight_headshot', reason: `size.type=${sizeType}` };
  }

  if (sizeType && ['标准一寸', '小一寸', '1inch'].includes(sizeType)) {
    return { preset: 'loose_headshot', reason: `size.type=${sizeType}` };
  }

  if (sizeType === '大一寸') {
    return { preset: 'id_card_standard', reason: 'size.type=大一寸' };
  }

  if (params.photo_type === 'custom') {
    return {
      preset: velmagicxSize === 'passport' ? 'passport_standard' : velmagicxSize === '2inch' ? 'tight_headshot' : 'id_card_standard',
      reason: `photo_type=custom velmagicxSize=${velmagicxSize}`,
    };
  }

  if (velmagicxSize === 'passport') {
    return { preset: 'passport_standard', reason: 'velmagicxSize=passport' };
  }

  if (velmagicxSize === '2inch') {
    return { preset: 'tight_headshot', reason: 'velmagicxSize=2inch' };
  }

  return { preset: 'id_card_standard', reason: 'default=id_card_standard' };
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
      photoType: params.photo_type,
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

    const explicitComposition = params.portrait?.composition || {};
    const inferred = inferCompositionPreset(params, velmagicxSize);
    const inferredPreset = explicitComposition.preset || inferred.preset;
    const presetReason = explicitComposition.preset ? 'explicit preset override' : inferred.reason;
    const effectiveComposition = {
      ...explicitComposition,
      preset: inferredPreset,
    };

    logger.info('Mapped VeLMagicX options', {
      velmagicxSize,
      backgroundColor,
      beautyLevel,
      photoType: params.photo_type || 'id_card',
      inferredPreset,
      presetReason,
      normalizedSize: getNormalizedSizeMm(params),
      effectiveComposition,
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
      composition: effectiveComposition,
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
      inferredPreset,
      presetReason,
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
      photoType: params.photo_type,
      backgroundColor: params.background?.color,
      outputFormat: params.output?.format,
    });
    throw error;
  }
}
