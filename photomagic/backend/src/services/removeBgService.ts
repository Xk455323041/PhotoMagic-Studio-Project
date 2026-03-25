import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import env from '../config/env';
import logger from '../config/logger';
import { BackgroundRemovalParams } from '../types';

/**
 * Remove.bg API 服务
 * 真实的背景移除服务实现
 */
export class RemoveBgService {
  private apiKey: string;
  private endpoint: string;

  constructor() {
    this.apiKey = env.removeBgApiKey;
    this.endpoint = env.removeBgEndpoint;
  }

  /**
   * 调用Remove.bg API移除背景
   */
  async removeBackground(
    filePath: string,
    params: BackgroundRemovalParams = {}
  ): Promise<Buffer> {
    if (!this.apiKey) {
      throw new Error('Remove.bg API key not configured');
    }

    try {
      logger.info('Calling Remove.bg API', { filePath, params });

      const formData = new FormData();
      formData.append('image_file', fs.createReadStream(filePath));
      
      // 设置参数
      formData.append('size', params.size || 'auto');
      formData.append('format', params.format || 'png');
      
      if (params.bg_color && params.bg_color !== 'transparent') {
        formData.append('bg_color', params.bg_color);
      }

      // 高级参数
      if (params.edge_smoothness) {
        formData.append('edge_smoothness', params.edge_smoothness);
      }
      
      if (params.hair_detail !== undefined) {
        formData.append('hair_detail', params.hair_detail ? 'true' : 'false');
      }
      
      if (params.shadow !== undefined) {
        formData.append('shadow', params.shadow ? 'true' : 'false');
      }

      const response = await axios.post(
        `${this.endpoint}/removebg`,
        formData,
        {
          headers: {
            'X-Api-Key': this.apiKey,
            ...formData.getHeaders(),
          },
          responseType: 'arraybuffer',
          timeout: 30000, // 30秒超时
        }
      );

      logger.info('Remove.bg API call successful', {
        responseSize: response.data.length,
        contentType: response.headers['content-type']
      });

      return response.data;
    } catch (error: any) {
      logger.error('Remove.bg API call failed', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data?.toString()
      });

      if (error.response?.status === 402) {
        throw new Error('API额度不足，请稍后再试或联系管理员');
      } else if (error.response?.status === 400) {
        throw new Error('图片处理失败，请检查图片是否有效');
      } else if (error.response?.status === 401) {
        throw new Error('API认证失败，请联系管理员');
      } else {
        throw new Error('背景移除服务暂时不可用，请稍后再试');
      }
    }
  }

  /**
   * 查询API余额
   */
  async getAccountBalance(): Promise<{ credits: number; total: number }> {
    if (!this.apiKey) {
      throw new Error('Remove.bg API key not configured');
    }

    try {
      const response = await axios.get(`${this.endpoint}/account`, {
        headers: {
          'X-Api-Key': this.apiKey,
        },
      });

      return {
        credits: response.data.data.attributes.credits,
        total: response.data.data.attributes.total,
      };
    } catch (error) {
      logger.error('Failed to get Remove.bg account balance', error);
      throw new Error('无法查询API余额');
    }
  }
}

// 单例实例
export const removeBgService = new RemoveBgService();
