import sharp from 'sharp';
import { imagex } from '@volcengine/openapi';
import env from '../config/env';
import logger from '../config/logger';
import { getFilePath, saveProcessingResult } from './fileService';

class VeLMagicXCapabilityError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, any>;

  constructor(message: string, code = 'VELMAGICX_OFFICIAL_CALL_FAILED', details?: Record<string, any>) {
    super(message);
    this.name = 'VeLMagicXCapabilityError';
    this.code = code;
    this.details = details;
  }
}

/**
 * veImageX / 火山引擎接入适配层（第一阶段骨架）
 *
 * 当前状态：
 * - 已停止使用错误的“自定义 endpoint + Action + 手写 HMAC”调用方式。
 * - 后续应切换到官方 Node.js SDK（@volcengine/openapi）或其等价官方接入方式。
 * - 证件照当前优先走官方 SDK 路线；官方失败时直接透出真实错误，不再默认静默 fallback。
 */
export class VeLMagicXService {
  private accessKeyId: string;
  private secretAccessKey: string;
  private serviceId: string;
  private region: string;
  private endpoint: string;
  private publicDomain: string;
  private sourceTemplate: string;
  private processTemplate: string;
  private secretMode: 'raw' | 'base64-decoded';
  private imagexService: imagex.ImagexService;

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
    this.publicDomain = env.velmagicxPublicDomain.trim();
    this.sourceTemplate = env.velmagicxSourceTemplate.trim();
    this.processTemplate = env.velmagicxProcessTemplate.trim();
    this.imagexService = new imagex.ImagexService({
      serviceName: 'imagex',
      region: this.region,
      host: this.endpoint || 'imagex.volcengineapi.com',
    });

    logger.info(
      `[VeLMagicXDebug] init provider=veImageX region=${this.region} serviceId=${this.serviceId} endpoint=${this.endpoint || 'auto-sdk'} publicDomain=${this.publicDomain || 'auto-service-domain'} sourceTemplate=${this.sourceTemplate || 'none'} processTemplate=${this.processTemplate || 'none'} secretMode=${this.secretMode}`
    );
  }

  private normalizeSecretKey(raw: string): { value: string; mode: 'raw' | 'base64-decoded' } {
    if (!raw) {
      return { value: raw, mode: 'raw' };
    }

    return { value: raw.trim(), mode: 'raw' };
  }

  private configureImagexClient(): void {
    this.imagexService.setAccessKeyId(this.accessKeyId);
    this.imagexService.setSecretKey(this.secretAccessKey);
    this.imagexService.setRegion(this.region);
    if (this.endpoint) {
      this.imagexService.setHost(this.endpoint);
    }
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

  private buildOfficialSdkError(error: any, context: Record<string, any> = {}): VeLMagicXCapabilityError {
    const rawCode = error?.code || error?.Code || error?.ResponseMetadata?.Error?.Code || error?.metadata?.code;
    const rawMessage = error?.message || error?.Message || error?.msg || 'unknown official sdk error';
    const requestId = error?.requestId || error?.RequestId || error?.ResponseMetadata?.RequestId || error?.metadata?.requestId;
      const details = {
      ...context,
      code: rawCode || 'UNKNOWN',
      requestId: requestId || undefined,
      httpStatus: error?.statusCode || error?.status || error?.$metadata?.httpStatusCode || undefined,
      message: rawMessage,
      publicDomain: this.publicDomain || undefined,
    };

    const isForbiddenAddon = String(rawCode || '').includes('Forbidden.Addon') || String(rawMessage || '').includes('Forbidden.Addon');
    const userMessage = isForbiddenAddon
      ? `veImageX 官方能力未开通：${rawCode || 'Forbidden.Addon'}${requestId ? `（requestId=${requestId}）` : ''}。请先在火山引擎控制台为 serviceId=${this.serviceId} 开通人像分割/抠图相关附加组件。`
      : `veImageX 官方调用失败：${rawCode || 'UNKNOWN'} - ${rawMessage}${requestId ? `（requestId=${requestId}）` : ''}`;

    return new VeLMagicXCapabilityError(userMessage, rawCode || 'VELMAGICX_OFFICIAL_CALL_FAILED', details);
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

  private async uploadBase64ImageToImagex(
    imageBase64: string,
    format: 'jpg' | 'png' = 'png'
  ): Promise<{ storeUri: string }> {
    this.configureImagexClient();

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const buffer = Buffer.from(imageBase64, 'base64');

    const uploadRes = await this.imagexService.UploadImages(
      {
        ApplyParams: {
          ServiceId: this.serviceId,
          UploadNum: 1,
        },
        ContentTypes: [mimeType],
      },
      [buffer]
    );

    const storeUri = uploadRes?.Result?.Results?.[0]?.Uri;
    if (!storeUri) {
      throw new Error('veImageX UploadImages succeeded but no store uri was returned');
    }

    logger.info('[VeLMagicXDebug] imagex-upload-complete', {
      storeUri,
      mimeType,
      size: buffer.length,
    });

    return { storeUri };
  }

  private async getDefaultDomain(): Promise<string> {
    if (this.publicDomain) {
      return this.publicDomain;
    }

    this.configureImagexClient();

    const domainsRes = await this.imagexService.GetServiceDomains({
      ServiceId: this.serviceId,
    });

    const domains = domainsRes?.Result || [];
    const preferred = domains.find((item: any) => item?.is_default && item?.domain) || domains.find((item: any) => item?.domain);
    const domain = preferred?.domain;

    if (!domain) {
      throw new Error('veImageX GetServiceDomains returned no accessible domain and VELMAGICX_PUBLIC_DOMAIN is empty');
    }

    return domain;
  }

  private async getResourceUrl(storeUri: string, format: 'jpg' | 'png' = 'png'): Promise<string> {
    this.configureImagexClient();

    const domain = await this.getDefaultDomain();
    const tpl = this.processTemplate;
    const requestData: any = {
      ServiceId: this.serviceId,
      Domain: domain,
      URI: storeUri,
      Proto: 'https',
      Format: format === 'jpg' ? 'jpeg' : 'png',
    };

    if (tpl) {
      requestData.Tpl = tpl;
    }

    const resourceRes = await this.imagexService.GetResourceURL(requestData);

    logger.info('[VeLMagicXDebug] imagex-resource-url-raw-response', {
      domain,
      storeUri,
      tpl,
      responseMetadata: resourceRes?.ResponseMetadata || null,
      result: resourceRes?.Result || null,
    });

    const apiError = resourceRes?.ResponseMetadata?.Error;
    if (apiError) {
      throw new Error(`veImageX GetResourceURL error: ${apiError.Code || 'UNKNOWN'} - ${apiError.Message || 'unknown error'}`);
    }

    const url = resourceRes?.Result?.URL || resourceRes?.Result?.ObjURL || resourceRes?.Result?.CompactURL || resourceRes?.Result?.ObjCompactURL;
    if (!url) {
      throw new Error('veImageX GetResourceURL returned no URL');
    }

    return url;
  }

  private async segmentHumanPortrait(
    imageBase64: string,
    format: 'jpg' | 'png' = 'png'
  ): Promise<{ segmentedUrl: string; segmentedStoreUri: string }> {
    const { storeUri } = await this.uploadBase64ImageToImagex(imageBase64, format);
    this.configureImagexClient();

    const segmentRes = await this.imagexService.GetSegmentImage({
      ServiceId: this.serviceId,
      Class: 'humanv2',
      OutFormat: 'png',
      Refine: true,
      StoreUri: storeUri,
      TransBg: false,
    });

    logger.info('[VeLMagicXDebug] imagex-segmentation-raw-response', {
      inputStoreUri: storeUri,
      responseMetadata: segmentRes?.ResponseMetadata || null,
      result: segmentRes?.Result || null,
      rawResponse: segmentRes || null,
    });

    const segmentedStoreUri = segmentRes?.Result?.ResUri;
    if (!segmentedStoreUri) {
      throw new Error('veImageX GetSegmentImage returned no ResUri');
    }

    const segmentedUrl = await this.getResourceUrl(segmentedStoreUri, 'png');

    logger.info('[VeLMagicXDebug] imagex-segmentation-complete', {
      inputStoreUri: storeUri,
      segmentedStoreUri,
      segmentedUrl,
    });

    return { segmentedUrl, segmentedStoreUri };
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
    this.ensureConfigured();

    const requestedFormat: 'png' = 'png';

    try {
      logger.info(
        `[VeLMagicXDebug] official-sdk-attempt capability=humanSegmentation region=${this.region} serviceId=${this.serviceId} endpoint=${this.endpoint || 'auto-sdk'}`
      );

      const { segmentedUrl, segmentedStoreUri } = await this.segmentHumanPortrait(imageBase64, requestedFormat);
      const segmentedResponse = await fetch(segmentedUrl);
      if (!segmentedResponse.ok) {
        throw new Error(`failed to fetch segmented image status=${segmentedResponse.status}`);
      }

      const segmentedBuffer = Buffer.from(await segmentedResponse.arrayBuffer());
      let output = sharp(segmentedBuffer).ensureAlpha();

      if (options.background_color && options.background_color !== 'transparent') {
        output = output.flatten({ background: this.normalizeBackgroundColor(options.background_color) as any });
      }

      const foregroundBuffer = await output.png().toBuffer();
      const foregroundBase64 = foregroundBuffer.toString('base64');

      logger.info('[VeLMagicXDebug] official-sdk-complete', {
        capability: 'humanSegmentation',
        segmentedStoreUri,
        segmentedUrl,
        returnMask: !!options.return_mask,
        returnForeground: options.return_foreground !== false,
      });

      return {
        foreground: options.return_foreground === false ? undefined : foregroundBase64,
        mask: undefined,
        score: 0.9,
      };
    } catch (error: any) {
      const officialError = this.buildOfficialSdkError(error, {
        capability: 'humanSegmentation',
        region: this.region,
        serviceId: this.serviceId,
        endpoint: this.endpoint || 'auto-sdk',
      });

      logger.warn('[VeLMagicXDebug] official-sdk-failed', {
        code: officialError.code,
        message: officialError.message,
        details: officialError.details,
      });

      throw officialError;
    }
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
    this.ensureConfigured();

    try {
      logger.info(
        `[VeLMagicXDebug] official-sdk-attempt capability=backgroundReplacement region=${this.region} serviceId=${this.serviceId} endpoint=${this.endpoint || 'auto-sdk'}`
      );

      const segmentation = await this.humanSegmentation(foregroundBase64, {
        return_foreground: true,
        background_color: 'transparent',
      });

      if (!segmentation.foreground) {
        throw new Error('humanSegmentation returned empty foreground');
      }

      const foreground = sharp(Buffer.from(segmentation.foreground, 'base64')).ensureAlpha();
      const background = sharp(Buffer.from(backgroundBase64, 'base64')).rotate();

      const [fgMeta, bgMeta] = await Promise.all([foreground.metadata(), background.metadata()]);
      if (!fgMeta.width || !fgMeta.height || !bgMeta.width || !bgMeta.height) {
        throw new Error('unable to resolve foreground/background dimensions');
      }

      const scale = Math.max(0.1, Math.min(3, options.scale || 1));
      const resizedForeground = await foreground
        .resize(Math.max(1, Math.round(fgMeta.width * scale)))
        .png()
        .toBuffer();

      const resizedMeta = await sharp(resizedForeground).metadata();
      const left = Math.round(((bgMeta.width - (resizedMeta.width || 0)) * (options.position?.x ?? 0.5)));
      const top = Math.round(((bgMeta.height - (resizedMeta.height || 0)) * (options.position?.y ?? 0.5)));

      const resultBuffer = await background
        .ensureAlpha()
        .composite([{ input: resizedForeground, left: Math.max(0, left), top: Math.max(0, top) }])
        .png()
        .toBuffer();

      return {
        result_image: resultBuffer.toString('base64'),
        composition_score: 0.85,
      };
    } catch (error: any) {
      const officialError = this.buildOfficialSdkError(error, {
        capability: 'backgroundReplacement',
        region: this.region,
        serviceId: this.serviceId,
        endpoint: this.endpoint || 'auto-sdk',
      });

      logger.warn('[VeLMagicXDebug] official-sdk-failed', {
        code: officialError.code,
        message: officialError.message,
        details: officialError.details,
      });

      throw officialError;
    }
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

    const requestedFormat = options.output_format === 'jpg' ? 'jpg' : 'png';

    try {
      logger.info(
        `[VeLMagicXDebug] official-sdk-attempt capability=idPhotoProcessing region=${this.region} serviceId=${this.serviceId} endpoint=${this.endpoint || 'auto-sdk'}`
      );

      const { segmentedUrl, segmentedStoreUri } = await this.segmentHumanPortrait(imageBase64, requestedFormat);
      const segmentedResponse = await fetch(segmentedUrl);
      if (!segmentedResponse.ok) {
        throw new Error(`failed to fetch segmented image status=${segmentedResponse.status}`);
      }
      const segmentedBuffer = Buffer.from(await segmentedResponse.arrayBuffer());
      const segmentedBase64 = segmentedBuffer.toString('base64');

      const { idPhotoBase64, width, height } = await this.composeIdPhoto(segmentedBase64, options);
      const layoutPhotoBase64 = await this.buildLayoutPhoto(idPhotoBase64, {
        layout: options.layout,
        output_format: options.output_format,
      });

      logger.info('[VeLMagicXDebug] official-sdk-complete', {
        width,
        height,
        segmentedStoreUri,
        segmentedUrl,
        hasLayoutPhoto: !!layoutPhotoBase64,
        beautyLevel: options.beauty_level || 0,
        zoom: options.zoom || 1,
        composition: options.composition || {},
        effectivePreset: options.composition?.preset,
      });

      return {
        id_photo: idPhotoBase64,
        layout_photo: layoutPhotoBase64,
        compliance_score: 0.9,
      };
    } catch (error: any) {
      const officialError = this.buildOfficialSdkError(error, {
        capability: 'idPhotoProcessing',
        region: this.region,
        serviceId: this.serviceId,
        endpoint: this.endpoint || 'auto-sdk',
      });

      logger.warn('[VeLMagicXDebug] official-sdk-failed', {
        code: officialError.code,
        message: officialError.message,
        details: officialError.details,
      });

      throw officialError;
    }
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
