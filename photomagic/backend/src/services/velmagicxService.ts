import env from '../config/env';
import logger from '../config/logger';

/**
 * veImageX / 火山引擎接入适配层（第一阶段骨架）
 *
 * 当前状态：
 * - 已停止使用错误的“自定义 endpoint + Action + 手写 HMAC”调用方式。
 * - 后续应切换到官方 Node.js SDK（@volcengine/openapi）或其等价官方接入方式。
 * - 在未完成正式 SDK 接入前，所有能力调用统一抛出明确错误，避免继续请求错误域名。
 */
export class VeLMagicXService {
  private accessKeyId: string;
  private secretAccessKey: string;
  private serviceId: string;
  private region: string;
  private endpoint: string;
  private secretMode: 'raw' | 'base64-decoded';

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
    void imageBase64;
    void options;
    this.ensureConfigured();
    this.sdkMigrationError('idPhotoProcessing');
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
