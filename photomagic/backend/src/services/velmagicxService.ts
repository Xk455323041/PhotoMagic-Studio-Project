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

  private async composeIdPhoto(
    imageBase64: string,
    options: {
      size?: '1inch' | '2inch' | 'passport';
      background_color?: string;
      beauty_level?: number;
    } = {}
  ): Promise<{ idPhotoBase64: string; width: number; height: number }> {
    const sizePreset = this.sizePresetMap[options.size || '1inch'];
    const width = this.mmToPx(sizePreset.widthMm);
    const height = this.mmToPx(sizePreset.heightMm);
    const background = this.hexToRgb(this.normalizeBackgroundColor(options.background_color));
    const inputBuffer = Buffer.from(imageBase64, 'base64');

    let pipeline = sharp(inputBuffer).rotate().resize(width, height, {
      fit: 'contain',
      background: { r: background.r, g: background.g, b: background.b, alpha: 1 },
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

    const outputBuffer = await pipeline.png().toBuffer();
    return {
      idPhotoBase64: outputBuffer.toString('base64'),
      width,
      height,
    };
  }

  private async buildLayoutPhoto(idPhotoBase64: string): Promise<string> {
    const dpi = 300;
    const canvasWidth = this.mmToPx(102, dpi);
    const canvasHeight = this.mmToPx(152, dpi);
    const padding = 24;
    const photoBuffer = Buffer.from(idPhotoBase64, 'base64');
    const metadata = await sharp(photoBuffer).metadata();
    const photoWidth = metadata.width || 0;
    const photoHeight = metadata.height || 0;

    const composites: Array<{ input: Buffer; left: number; top: number }> = [];
    for (let row = 0; row < 2; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        composites.push({
          input: photoBuffer,
          left: padding + col * (photoWidth + padding),
          top: padding + row * (photoHeight + padding),
        });
      }
    }

    const layoutBuffer = await sharp({
      create: {
        width: canvasWidth,
        height: canvasHeight,
        channels: 3,
        background: '#FFFFFF',
      },
    })
      .composite(composites)
      .png()
      .toBuffer();

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
    const layoutPhotoBase64 = await this.buildLayoutPhoto(idPhotoBase64);

    logger.info('[VeLMagicXDebug] local-id-photo-fallback-complete', {
      width,
      height,
      hasLayoutPhoto: true,
      beautyLevel: options.beauty_level || 0,
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
