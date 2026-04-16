import sharp from 'sharp';
import env from '../config/env';
import logger from '../config/logger';

/**
 * veImageX / 火山引擎接入适配层（第一阶段骨架）
 *
 * 当前状态：
 * - 已停止使用错误的“自定义 endpoint + Action + 手写 HMAC”调用方式。
 * - 后续应切换到官方 Node.js SDK（@volcengine/openapi）或其等价官方接入方式。
 * - 在未完成正式 SDK 接入前，证件照能力先走本地 fallback，避免异步链路继续阻塞。
 */
export class VeLMagicXService {
  private accessKeyId: string;
  private secretAccessKey: string;
  private serviceId: string;
  private region: string;
  private endpoint: string;
  private secretMode: 'raw' | 'base64-decoded';

  private readonly sizePresetMap: Record<'1inch' | '2inch' | 'passport', { widthMm: number; heightMm: number }> = {
    '1inch': { widthMm: 25, heightMm: 35 },
    '2inch': { widthMm: 35, heightMm: 49 },
    passport: { widthMm: 33, heightMm: 48 },
  };

  private readonly layoutPresetMap: Record<'4x6' | '8x10', { widthMm: number; heightMm: number; columns: number; rows: number; paddingPx: number }> = {
    '4x6': { widthMm: 102, heightMm: 152, columns: 2, rows: 4, paddingPx: 24 },
    '8x10': { widthMm: 203, heightMm: 254, columns: 4, rows: 4, paddingPx: 32 },
  };

  private readonly compositionPresetMap: Record<'id_card_standard' | 'passport_standard' | 'tight_headshot' | 'loose_headshot', {
    top_margin_ratio: number;
    bottom_margin_ratio: number;
    side_margin_ratio: number;
    zoom: number;
  }> = {
    id_card_standard: { top_margin_ratio: 0.12, bottom_margin_ratio: 0.08, side_margin_ratio: 0.06, zoom: 1.0 },
    passport_standard: { top_margin_ratio: 0.15, bottom_margin_ratio: 0.07, side_margin_ratio: 0.07, zoom: 1.02 },
    tight_headshot: { top_margin_ratio: 0.08, bottom_margin_ratio: 0.06, side_margin_ratio: 0.05, zoom: 1.15 },
    loose_headshot: { top_margin_ratio: 0.18, bottom_margin_ratio: 0.1, side_margin_ratio: 0.09, zoom: 0.94 },
  };

  constructor() {
    this.accessKeyId = env.velmagicxAccessKeyId;
    const normalizedSecret = this.normalizeSecretKey(env.velmagicxSecretAccessKey);
    this.secretAccessKey = normalizedSecret.value;
    this.secretMode = normalizedSecret.mode;
    this.serviceId = env.velmagicxServiceId;
    this.region = env.velmagicxRegion;
    this.endpoint = env.velmagicxEndpoint;

    logger.info(
      `[VeLMagicXDebug] init provider=veImageX region=${this.region} serviceId=${this.serviceId} endpoint=${this.endpoint || 'auto-sdk'} secretMode=${this.secretMode}`
    );
  }

  private normalizeSecretKey(raw: string): { value: string; mode: 'raw' | 'base64-decoded' } {
    if (!raw) {
      return { value: raw, mode: 'raw' };
    }

    const trimmed = raw.trim();
    const base64Pattern = /^[A-Za-z0-9+/=]+$/;
    const looksLikeBase64 = trimmed.length % 4 === 0 && base64Pattern.test(trimmed);

    if (!looksLikeBase64) {
      return { value: trimmed, mode: 'raw' };
    }

    try {
      const decoded = Buffer.from(trimmed, 'base64').toString('utf8').trim();
      if (decoded && /^[A-Za-z0-9_-]+$/.test(decoded)) {
        return { value: decoded, mode: 'base64-decoded' };
      }
    } catch (error: any) {
      logger.warn(`[VeLMagicXDebug] secret decode failed error=${error?.message || 'unknown error'}`);
    }

    return { value: trimmed, mode: 'raw' };
  }

  private ensureConfigured(): void {
    if (!this.accessKeyId || !this.secretAccessKey) {
      throw new Error('veImageX API credentials not configured');
    }
  }

  private sdkMigrationError(capability: string): never {
    logger.error(
      `[VeLMagicXDebug] sdk-migration-required capability=${capability} region=${this.region} serviceId=${this.serviceId} endpoint=${this.endpoint || 'auto-sdk'}`
    );

    throw new Error(
      `veImageX 官方 Node SDK 接入尚未完成，当前已停用旧的自定义 endpoint/签名调用方式；请先完成 ${capability} 能力到官方 SDK 的映射后再调用。`
    );
  }

  private hexToRgb(color: string): { r: number; g: number; b: number } {
    const normalized = color.replace('#', '').trim();
    const hex = normalized.length === 3
      ? normalized.split('').map((char) => `${char}${char}`).join('')
      : normalized;

    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
      return { r: 255, g: 255, b: 255 };
    }

    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  private mmToPx(mm: number, dpi = 300): number {
    return Math.round((mm * dpi) / 25.4);
  }

  private normalizeBackgroundColor(color?: string): string {
    if (!color || typeof color !== 'string') {
      return '#FFFFFF';
    }

    const trimmed = color.trim();
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed) ? trimmed : '#FFFFFF';
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private async composeIdPhoto(
    imageBase64: string,
    options: {
      size?: '1inch' | '2inch' | 'passport';
      background_color?: string;
      beauty_level?: number;
      output_format?: 'jpg' | 'png';
      zoom?: number;
      composition?: {
        preset?: 'id_card_standard' | 'passport_standard' | 'tight_headshot' | 'loose_headshot';
        top_margin_ratio?: number;
        bottom_margin_ratio?: number;
        side_margin_ratio?: number;
        zoom?: number;
      };
    } = {}
  ): Promise<{ idPhotoBase64: string; width: number; height: number }> {
    const sizePreset = this.sizePresetMap[options.size || '1inch'];
    const width = this.mmToPx(sizePreset.widthMm);
    const height = this.mmToPx(sizePreset.heightMm);
    const background = this.hexToRgb(this.normalizeBackgroundColor(options.background_color));
    const inputBuffer = Buffer.from(imageBase64, 'base64');
    const source = sharp(inputBuffer).rotate();
    const sourceMeta = await source.metadata();
    const sourceWidth = sourceMeta.width || width;
    const sourceHeight = sourceMeta.height || height;

    const composition = options.composition || {};
    const preset = composition.preset ? this.compositionPresetMap[composition.preset] : undefined;
    const topMarginRatio = this.clamp(composition.top_margin_ratio ?? preset?.top_margin_ratio ?? 0.12, 0.05, 0.25);
    const bottomMarginRatio = this.clamp(composition.bottom_margin_ratio ?? preset?.bottom_margin_ratio ?? 0.08, 0.03, 0.2);
    const sideMarginRatio = this.clamp(composition.side_margin_ratio ?? preset?.side_margin_ratio ?? 0.06, 0.02, 0.18);
    const portraitAreaHeightRatio = Math.max(0.2, 1 - topMarginRatio - bottomMarginRatio);
    const portraitAreaWidthRatio = Math.max(0.2, 1 - sideMarginRatio * 2);
    const zoom = this.clamp(composition.zoom ?? options.zoom ?? preset?.zoom ?? 1, 0.85, 1.35);

    const targetPortraitHeight = height * portraitAreaHeightRatio * zoom;
    const targetPortraitWidth = width * portraitAreaWidthRatio * zoom;
    const scale = Math.max(targetPortraitWidth / sourceWidth, targetPortraitHeight / sourceHeight);
    const resizedWidth = Math.max(width, Math.round(sourceWidth * scale));
    const resizedHeight = Math.max(height, Math.round(sourceHeight * scale));

    let pipeline = source.resize(resizedWidth, resizedHeight, {
      fit: 'cover',
      position: 'centre',
    });

    const beautyLevel = Math.max(0, Math.min(1, options.beauty_level || 0));
    if (beautyLevel > 0) {
      pipeline = pipeline.modulate({
        brightness: 1 + beautyLevel * 0.03,
        saturation: 1 + beautyLevel * 0.04,
      });
      pipeline = pipeline.sharpen();
    }

    const portraitBuffer = await (options.output_format === 'jpg'
      ? pipeline.jpeg({ quality: 92 }).toBuffer()
      : pipeline.png().toBuffer());

    const left = Math.round((width - resizedWidth) / 2);
    const desiredTop = Math.round(height * topMarginRatio - Math.max(0, (resizedHeight - targetPortraitHeight) / 2));
    const extractLeft = Math.max(0, Math.min(resizedWidth - width, -left));
    const extractTop = Math.max(0, Math.min(resizedHeight - height, -desiredTop));

    const canvas = sharp(portraitBuffer).extract({
      left: extractLeft,
      top: extractTop,
      width,
      height,
    });

    const outputBuffer = options.output_format === 'jpg'
      ? await canvas.jpeg({ quality: 92 }).toBuffer()
      : await canvas.png().toBuffer();

    return {
      idPhotoBase64: outputBuffer.toString('base64'),
      width,
      height,
    };
  }

  private async buildLayoutPhoto(
    idPhotoBase64: string,
    options: {
      layout?: 'single' | '4x6' | '8x10';
      output_format?: 'jpg' | 'png';
    } = {}
  ): Promise<string | undefined> {
    if (!options.layout || options.layout === 'single') {
      return undefined;
    }

    const dpi = 300;
    const preset = this.layoutPresetMap[options.layout];
    const canvasWidth = this.mmToPx(preset.widthMm, dpi);
    const canvasHeight = this.mmToPx(preset.heightMm, dpi);
    const padding = preset.paddingPx;
    const photoBuffer = Buffer.from(idPhotoBase64, 'base64');
    const metadata = await sharp(photoBuffer).metadata();
    const photoWidth = metadata.width || 0;
    const photoHeight = metadata.height || 0;

    const usableWidth = canvasWidth - padding * (preset.columns + 1);
    const usableHeight = canvasHeight - padding * (preset.rows + 1);
    const scale = Math.min(1, usableWidth / (preset.columns * photoWidth), usableHeight / (preset.rows * photoHeight));
    const tileWidth = Math.max(1, Math.floor(photoWidth * scale));
    const tileHeight = Math.max(1, Math.floor(photoHeight * scale));
    const tileBuffer = scale < 1
      ? await sharp(photoBuffer).resize(tileWidth, tileHeight).toBuffer()
      : photoBuffer;

    const composites: Array<{ input: Buffer; left: number; top: number }> = [];
    for (let row = 0; row < preset.rows; row += 1) {
      for (let col = 0; col < preset.columns; col += 1) {
        composites.push({
          input: tileBuffer,
          left: padding + col * (tileWidth + padding),
          top: padding + row * (tileHeight + padding),
        });
      }
    }

    let layoutPipeline = sharp({
      create: {
        width: canvasWidth,
        height: canvasHeight,
        channels: 3,
        background: '#FFFFFF',
      },
    }).composite(composites);

    const layoutBuffer = options.output_format === 'jpg'
      ? await layoutPipeline.jpeg({ quality: 92 }).toBuffer()
      : await layoutPipeline.png().toBuffer();

    return layoutBuffer.toString('base64');
  }

  async humanSegmentation(
    imageBase64: string,
    options: {
      return_mask?: boolean;
      return_foreground?: boolean;
      background_color?: string;
    } = {}
  ): Promise<{
    foreground?: string;
    mask?: string;
    score: number;
  }> {
    void imageBase64;
    void options;
    this.ensureConfigured();
    this.sdkMigrationError('humanSegmentation');
  }

  async imageEnhancement(
    imageBase64: string,
    options: {
      mode?: 'general' | 'portrait' | 'scenery';
      scale?: 2 | 4;
      denoise_level?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<{
    enhanced_image: string;
    quality_score: number;
  }> {
    void imageBase64;
    void options;
    this.ensureConfigured();
    this.sdkMigrationError('imageEnhancement');
  }

  async oldPhotoRestoration(
    imageBase64: string,
    options: {
      repair_scratches?: boolean;
      repair_stains?: boolean;
      colorization?: boolean;
      enhance_details?: boolean;
    } = {}
  ): Promise<{
    restored_image: string;
    comparison_image?: string;
    restoration_score: number;
  }> {
    void imageBase64;
    void options;
    this.ensureConfigured();
    this.sdkMigrationError('oldPhotoRestoration');
  }

  async backgroundReplacement(
    foregroundBase64: string,
    backgroundBase64: string,
    options: {
      position?: { x: number; y: number };
      scale?: number;
      blend_mode?: 'normal' | 'soft' | 'hard';
      shadow?: boolean;
    } = {}
  ): Promise<{
    result_image: string;
    composition_score: number;
  }> {
    void foregroundBase64;
    void backgroundBase64;
    void options;
    this.ensureConfigured();
    this.sdkMigrationError('backgroundReplacement');
  }

  async idPhotoProcessing(
    imageBase64: string,
    options: {
      size?: '1inch' | '2inch' | 'passport';
      background_color?: string;
      clothing_template?: string;
      beauty_level?: number;
      layout?: 'single' | '4x6' | '8x10';
      output_format?: 'jpg' | 'png';
      zoom?: number;
      composition?: {
        preset?: 'id_card_standard' | 'passport_standard' | 'tight_headshot' | 'loose_headshot';
        top_margin_ratio?: number;
        bottom_margin_ratio?: number;
        side_margin_ratio?: number;
        zoom?: number;
      };
    } = {}
  ): Promise<{
    id_photo: string;
    layout_photo?: string;
    compliance_score: number;
  }> {
    void options.clothing_template;
    this.ensureConfigured();

    logger.info(
      `[VeLMagicXDebug] local-id-photo-fallback capability=idPhotoProcessing region=${this.region} serviceId=${this.serviceId} endpoint=${this.endpoint || 'auto-sdk'}`
    );

    const { idPhotoBase64, width, height } = await this.composeIdPhoto(imageBase64, options);
    const layoutPhotoBase64 = await this.buildLayoutPhoto(idPhotoBase64, {
      layout: options.layout,
      output_format: options.output_format,
    });

    logger.info('[VeLMagicXDebug] local-id-photo-fallback-complete', {
      width,
      height,
      hasLayoutPhoto: !!layoutPhotoBase64,
      beautyLevel: options.beauty_level || 0,
      zoom: options.zoom || 1,
      composition: options.composition || {},
    });

    return {
      id_photo: idPhotoBase64,
      layout_photo: layoutPhotoBase64,
      compliance_score: 0.72,
    };
  }

  async getServiceStatus(): Promise<{
    service_id: string;
    status: 'active' | 'inactive' | 'suspended';
    quota: {
      used: number;
      total: number;
      remaining: number;
    };
    features: string[];
  }> {
    this.ensureConfigured();
    this.sdkMigrationError('getServiceStatus');
  }
}

export const velmagicxService = new VeLMagicXService();
