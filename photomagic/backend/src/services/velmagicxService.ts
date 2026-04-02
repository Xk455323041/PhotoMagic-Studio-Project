import axios from 'axios';
import crypto from 'crypto';
import env from '../config/env';
import logger from '../config/logger';

/**
 * 火山引擎 VeLMagicX 服务
 * 提供AI图片增强、人像分割、图像修复等功能
 */
export class VeLMagicXService {
  private accessKeyId: string;
  private secretAccessKey: string;
  private serviceId: string;
  private region: string;
  private endpoint: string;

  constructor() {
    this.accessKeyId = env.velmagicxAccessKeyId;
    this.secretAccessKey = env.velmagicxSecretAccessKey;
    this.serviceId = env.velmagicxServiceId;
    this.region = env.velmagicxRegion;
    this.endpoint = env.velmagicxEndpoint;
  }

  /**
   * 生成签名
   */
  private generateSignature(
    method: string,
    path: string,
    query: string,
    headers: Record<string, string>,
    body: string = ''
  ): string {
    const canonicalRequest = [
      method,
      path,
      query,
      Object.entries(headers)
        .map(([k, v]) => `${k.toLowerCase()}:${v.trim()}`)
        .join('\n'),
      '',
      Object.keys(headers)
        .map(k => k.toLowerCase())
        .join(';'),
      crypto.createHash('sha256').update(body).digest('hex')
    ].join('\n');

    const stringToSign = [
      'HMAC-SHA256',
      new Date().toISOString().split('.')[0] + 'Z',
      crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');

    const kDate = crypto
      .createHmac('sha256', this.secretAccessKey)
      .update(new Date().toISOString().split('T')[0])
      .digest();
    
    const kRegion = crypto
      .createHmac('sha256', kDate)
      .update(this.region)
      .digest();
    
    const kService = crypto
      .createHmac('sha256', kRegion)
      .update('volcengine')
      .digest();
    
    const kSigning = crypto
      .createHmac('sha256', kService)
      .update('request')
      .digest();

    return crypto
      .createHmac('sha256', kSigning)
      .update(stringToSign)
      .digest('hex');
  }

  /**
   * 调用VeLMagicX API
   */
  private async callApi(
    action: string,
    params: Record<string, any> = {}
  ): Promise<any> {
    if (!this.accessKeyId || !this.secretAccessKey) {
      throw new Error('VeLMagicX API credentials not configured');
    }

    const method = 'POST';
    const path = '/';
    const query = '';
    const body = JSON.stringify({
      Action: action,
      Version: '2021-08-01',
      ...params
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Date': new Date().toISOString().split('.')[0] + 'Z',
      'X-Content-Sha256': crypto.createHash('sha256').update(body).digest('hex'),
      'Host': new URL(this.endpoint).hostname
    };

    const signature = this.generateSignature(method, path, query, headers, body);
    
    headers['Authorization'] = `HMAC-SHA256 Credential=${this.accessKeyId}/${new Date().toISOString().split('T')[0]}/${this.region}/volcengine/request, SignedHeaders=${Object.keys(headers).map(k => k.toLowerCase()).join(';')}, Signature=${signature}`;

    try {
      logger.info('Calling VeLMagicX API', {
        action,
        endpoint: this.endpoint,
        region: this.region,
        serviceId: this.serviceId,
      });

      const response = await axios.post(this.endpoint, body, {
        headers,
        timeout: 120000
      });

      logger.info('VeLMagicX API call successful', {
        action,
        requestId: response.headers['x-request-id'],
        hasResult: !!response.data?.Result,
        responseKeys: response.data ? Object.keys(response.data) : [],
      });

      return response.data;
    } catch (error: any) {
      logger.error('VeLMagicX API call failed', {
        action,
        endpoint: this.endpoint,
        error: error.message,
        code: error.code,
        status: error.response?.status,
        requestId: error.response?.headers?.['x-request-id'],
        responseData: error.response?.data || null,
      });

      if (error.code === 'ECONNABORTED') {
        throw new Error('VeLMagicX请求超时，请稍后重试');
      } else if (error.response?.status === 403) {
        throw new Error('API权限不足，请检查AccessKey配置和权限');
      } else if (error.response?.status === 400) {
        throw new Error('请求参数错误，请检查参数格式');
      } else if (error.response?.status === 429) {
        throw new Error('请求频率过高，请稍后再试');
      } else {
        throw new Error('VeLMagicX服务暂时不可用，请稍后再试');
      }
    }
  }

  /**
   * 人像分割
   * 智能分割人像与背景
   */
  async humanSegmentation(
    imageBase64: string,
    options: {
      return_mask?: boolean;
      return_foreground?: boolean;
      background_color?: string;
    } = {}
  ): Promise<{
    foreground?: string; // 前景图base64
    mask?: string;      // 掩码图base64
    score: number;      // 分割置信度
  }> {
    const params = {
      ImageBase64: imageBase64,
      ServiceId: this.serviceId,
      ...options
    };

    const result = await this.callApi('HumanSegmentation', params);
    return result.Result;
  }

  /**
   * 图像增强
   * 提升图像质量、清晰度
   */
  async imageEnhancement(
    imageBase64: string,
    options: {
      mode?: 'general' | 'portrait' | 'scenery';
      scale?: 2 | 4;
      denoise_level?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<{
    enhanced_image: string; // 增强后图像base64
    quality_score: number;  // 质量评分
  }> {
    const params = {
      ImageBase64: imageBase64,
      ServiceId: this.serviceId,
      Mode: options.mode || 'general',
      Scale: options.scale || 2,
      DenoiseLevel: options.denoise_level || 'medium'
    };

    const result = await this.callApi('ImageEnhancement', params);
    return result.Result;
  }

  /**
   * 老照片修复
   * 修复破损、划痕、褪色照片
   */
  async oldPhotoRestoration(
    imageBase64: string,
    options: {
      repair_scratches?: boolean;
      repair_stains?: boolean;
      colorization?: boolean;
      enhance_details?: boolean;
    } = {}
  ): Promise<{
    restored_image: string;  // 修复后图像base64
    comparison_image?: string; // 对比图base64
    restoration_score: number; // 修复评分
  }> {
    const params = {
      ImageBase64: imageBase64,
      ServiceId: this.serviceId,
      RepairScratches: options.repair_scratches ?? true,
      RepairStains: options.repair_stains ?? true,
      Colorization: options.colorization ?? true,
      EnhanceDetails: options.enhance_details ?? true
    };

    const result = await this.callApi('OldPhotoRestoration', params);
    return result.Result;
  }

  /**
   * 背景替换
   * 智能替换图片背景
   */
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
    result_image: string;     // 合成结果base64
    composition_score: number; // 合成质量评分
  }> {
    const params = {
      ForegroundImageBase64: foregroundBase64,
      BackgroundImageBase64: backgroundBase64,
      ServiceId: this.serviceId,
      Position: options.position || { x: 0.5, y: 0.5 },
      Scale: options.scale || 1.0,
      BlendMode: options.blend_mode || 'normal',
      AddShadow: options.shadow ?? true
    };

    const result = await this.callApi('BackgroundReplacement', params);
    return result.Result;
  }

  /**
   * 证件照制作
   * 专业证件照处理
   */
  async idPhotoProcessing(
    imageBase64: string,
    options: {
      size?: '1inch' | '2inch' | 'passport';
      background_color?: string;
      clothing_template?: string;
      beauty_level?: number;
    } = {}
  ): Promise<{
    id_photo: string;        // 证件照base64
    layout_photo?: string;   // 排版照base64
    compliance_score: number; // 合规性评分
  }> {
    const params = {
      ImageBase64: imageBase64,
      ServiceId: this.serviceId,
      Size: options.size || '1inch',
      BackgroundColor: options.background_color || '#ffffff',
      ClothingTemplate: options.clothing_template,
      BeautyLevel: options.beauty_level || 0.5
    };

    const result = await this.callApi('IDPhotoProcessing', params);
    return result.Result;
  }

  /**
   * 查询服务状态
   */
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
    const params = {
      ServiceId: this.serviceId
    };

    const result = await this.callApi('GetServiceStatus', params);
    return result.Result;
  }
}

// 单例实例
export const velmagicxService = new VeLMagicXService();
