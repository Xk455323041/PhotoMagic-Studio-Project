import { IDPhotoParams, ProcessingResult } from '../types';
import { ID_PHOTO_BUSINESS_RULES, ID_PHOTO_SIZE_RULES, FallbackPreset, SizeMappingDecision, VeImagexSizeBucket } from '../config/idPhotoRules';
import { saveProcessingResult } from './fileService';
import { velmagicxService } from './velmagicxService';
import logger from '../config/logger';

type IDPhotoSizeType = NonNullable<NonNullable<IDPhotoParams['size']>['type']>;

function resolveSizeAndPreset(params: IDPhotoParams): SizeMappingDecision {
  const normalizedSize = getNormalizedSizeMm(params);
  const matchedBusinessRule = ID_PHOTO_BUSINESS_RULES.find((rule) => rule.match(params, normalizedSize));
  if (matchedBusinessRule) {
    return { bucket: matchedBusinessRule.bucket, preset: matchedBusinessRule.preset, reason: matchedBusinessRule.reason };
  }

  const matched = ID_PHOTO_SIZE_RULES.find((rule) => rule.match(params, normalizedSize));
  if (matched) {
    return { bucket: matched.bucket, preset: matched.preset, reason: matched.reason };
  }
  return { bucket: '1inch', preset: 'id_card_standard', reason: 'default=1inch/id_card_standard' };
}

function mapSizeToVelmagicx(
  sizeType?: string,
  customSize?: { width_mm?: number; height_mm?: number },
  photoType?: string
): VeImagexSizeBucket {
  return resolveSizeAndPreset({
    photo_type: photoType as IDPhotoParams['photo_type'],
    size: {
      type: (sizeType as IDPhotoSizeType | undefined) || 'custom',
      width_mm: customSize?.width_mm,
      height_mm: customSize?.height_mm,
    },
  }).bucket;
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
  velmagicxSize: VeImagexSizeBucket
): { preset: FallbackPreset; reason: string } {
  const resolved = resolveSizeAndPreset(params);

  if (resolved.bucket !== velmagicxSize) {
    return {
      preset: resolved.preset,
      reason: `${resolved.reason}; resolved.bucket=${resolved.bucket}; effective.bucket=${velmagicxSize}`,
    };
  }

  return {
    preset: resolved.preset,
    reason: resolved.reason,
  };
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

    const resolvedDecision = resolveSizeAndPreset(params);
    const velmagicxSize = resolvedDecision.bucket;
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
    const inferred = {
      preset: resolvedDecision.preset,
      reason: resolvedDecision.reason,
    };
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
      resolvedDecision,
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
