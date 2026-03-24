/**
 * 图片处理服务网关
 * 统一管理 Remove.bg 和 火山引擎 服务
 */

import { apiService, ApiResponse, UploadResponse } from './api'
import { getVeLMagicXService, VeLMagicXConfig } from './volcengine'
import toast from 'react-hot-toast'

export type ServiceType = 'remove-bg' | 'volcengine' | 'local'

export interface ServiceConfig {
  removeBg: {
    apiKey: string
    endpoint: string
    enabled: boolean
  }
  velmagicx: VeLMagicXConfig & {
    enabled: boolean
  }
  fallbackToLocal: boolean
  preferredService: ServiceType
}

export interface ProcessingRequest {
  service: ServiceType
  operation: 'background-removal' | 'photo-restoration' | 'image-enhancement' | 'id-photo' | 'format-conversion'
  imageUrl: string
  file?: File
  options: Record<string, any>
}

export interface ProcessingResult {
  success: boolean
  service: ServiceType
  operation: string
  resultUrl: string
  originalUrl: string
  processingTime: number
  cost: number // 处理成本（分）
  metadata: {
    width?: number
    height?: number
    size?: number
    format?: string
  }
  error?: string
}

class ServiceGateway {
  private config: ServiceConfig
  private velmagicxService: ReturnType<typeof getVeLMagicXService> | null = null

  constructor(config: ServiceConfig) {
    this.config = config
    
    // 初始化VeLMagicX服务
    if (config.velmagicx.enabled) {
      try {
        this.velmagicxService = getVeLMagicXService(config.velmagicx)
      } catch (error) {
        console.error('VeLMagicX服务初始化失败:', error)
        toast.error('VeLMagicX服务初始化失败')
      }
    }
  }

  /**
   * 选择最佳服务
   */
  private selectService(operation: ProcessingRequest['operation']): ServiceType {
    // 根据操作类型选择服务
    switch (operation) {
      case 'background-removal':
        return this.config.removeBg.enabled ? 'remove-bg' : 'local'
      
      case 'photo-restoration':
      case 'image-enhancement':
      case 'id-photo':
        return this.config.velmagicx.enabled ? 'velmagicx' : 'local'
      
      case 'format-conversion':
        // 格式转换优先使用VeLMagicX，如果没有则使用本地处理
        return this.config.velmagicx.enabled ? 'velmagicx' : 'local'
      
      default:
        return this.config.preferredService
    }
  }

  /**
   * 估算处理成本
   */
  private estimateCost(service: ServiceType, operation: string): number {
    // 成本估算（单位：分）
    const costMap: Record<ServiceType, Record<string, number>> = {
      'remove-bg': {
        'background-removal': 15, // $0.15 ≈ ¥1.05 ≈ 105分
      },
      'volcengine': {
        'photo-restoration': 30, // ¥0.30
        'image-enhancement': 20, // ¥0.20
        'id-photo': 50, // ¥0.50
        'format-conversion': 5, // ¥0.05
      },
      'local': {
        'background-removal': 0,
        'photo-restoration': 0,
        'image-enhancement': 0,
        'id-photo': 0,
        'format-conversion': 0,
      },
    }

    return costMap[service]?.[operation] || 0
  }

  /**
   * 处理图片
   */
  async processImage(request: ProcessingRequest): Promise<ProcessingResult> {
    const startTime = Date.now()
    const service = request.service || this.selectService(request.operation)
    const estimatedCost = this.estimateCost(service, request.operation)

    try {
      let resultUrl: string
      let metadata: ProcessingResult['metadata'] = {}

      switch (service) {
        case 'remove-bg':
          resultUrl = await this.processWithRemoveBg(request)
          break

        case 'volcengine':
          resultUrl = await this.processWithVolcengine(request)
          break

        case 'local':
          resultUrl = await this.processLocally(request)
          break

        default:
          throw new Error(`不支持的服务类型: ${service}`)
      }

      const processingTime = Date.now() - startTime

      return {
        success: true,
        service,
        operation: request.operation,
        resultUrl,
        originalUrl: request.imageUrl,
        processingTime,
        cost: estimatedCost,
        metadata,
        error: undefined,
      }
    } catch (error) {
      console.error(`图片处理失败 (${service}):`, error)

      // 如果失败且允许回退到本地处理
      if (this.config.fallbackToLocal && service !== 'local') {
        toast.warning(`${this.getServiceName(service)}处理失败，尝试本地处理`)
        return this.processImage({
          ...request,
          service: 'local',
        })
      }

      return {
        success: false,
        service,
        operation: request.operation,
        resultUrl: '',
        originalUrl: request.imageUrl,
        processingTime: Date.now() - startTime,
        cost: estimatedCost,
        metadata: {},
        error: error instanceof Error ? error.message : '处理失败',
      }
    }
  }

  /**
   * 使用 Remove.bg 处理
   */
  private async processWithRemoveBg(request: ProcessingRequest): Promise<string> {
    if (!this.config.removeBg.enabled) {
      throw new Error('Remove.bg 服务未启用')
    }

    if (!request.file) {
      throw new Error('需要文件进行背景移除')
    }

    // 调用 Remove.bg API
    const formData = new FormData()
    formData.append('image_file', request.file)
    formData.append('size', 'auto')
    
    if (request.options?.format) {
      formData.append('format', request.options.format)
    }

    try {
      const response = await fetch(this.config.removeBg.endpoint, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.config.removeBg.apiKey,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Remove.bg API 错误: ${error}`)
      }

      const blob = await response.blob()
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error('Remove.bg 处理失败:', error)
      throw error
    }
  }

  /**
   * 使用火山引擎处理
   */
  private async processWithVolcengine(request: ProcessingRequest): Promise<string> {
    if (!this.volcengineService) {
      throw new Error('火山引擎服务未初始化')
    }

    const { operation, options } = request

    switch (operation) {
      case 'photo-restoration':
        const restorationResult = await this.volcengineService.restoreOldPhoto(
          request.imageUrl,
          options.restoration
        )
        
        if (!restorationResult.success || !restorationResult.url) {
          throw new Error(restorationResult.error || '老照片修复失败')
        }
        
        return restorationResult.url

      case 'image-enhancement':
        const enhanceResult = await this.volcengineService.enhanceImage(
          request.imageUrl,
          options.enhance
        )
        
        if (!enhanceResult.success || !enhanceResult.url) {
          throw new Error(enhanceResult.error || '图像增强失败')
        }
        
        return enhanceResult.url

      case 'id-photo':
        const idPhotoResult = await this.volcengineService.createIDPhoto(
          request.imageUrl,
          options.idPhoto
        )
        
        if (!idPhotoResult.success || !idPhotoResult.url) {
          throw new Error(idPhotoResult.error || '证件照生成失败')
        }
        
        return idPhotoResult.url

      case 'format-conversion':
        const processResult = await this.volcengineService.processImage(
          request.imageUrl,
          options
        )
        
        if (!processResult.success || !processResult.url) {
          throw new Error(processResult.error || '格式转换失败')
        }
        
        return processResult.url

      default:
        throw new Error(`火山引擎不支持的操作: ${operation}`)
    }
  }

  /**
   * 本地处理（Canvas API）
   */
  private async processLocally(request: ProcessingRequest): Promise<string> {
    const { operation, options } = request

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            throw new Error('无法创建画布上下文')
          }

          // 设置画布尺寸
          canvas.width = img.width
          canvas.height = img.height

          // 绘制原始图片
          ctx.drawImage(img, 0, 0)

          // 根据操作类型进行处理
          switch (operation) {
            case 'format-conversion':
              // 格式转换
              const format = options.format || 'png'
              const quality = options.quality || 0.92
              
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    resolve(URL.createObjectURL(blob))
                  } else {
                    reject(new Error('格式转换失败'))
                  }
                },
                `image/${format}`,
                quality
              )
              break

            case 'background-removal':
              // 简单的背景移除（基于颜色阈值）
              this.removeBackgroundLocally(canvas, ctx, options)
                .then((blob) => resolve(URL.createObjectURL(blob)))
                .catch(reject)
              break

            default:
              // 其他操作暂不支持本地处理
              reject(new Error(`本地处理不支持的操作: ${operation}`))
          }
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }

      img.src = request.imageUrl
    })
  }

  /**
   * 本地背景移除（简单实现）
   */
  private async removeBackgroundLocally(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    options: any
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // 简单的背景移除：将接近白色的像素设为透明
        const threshold = options.threshold || 240
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          
          // 如果像素接近白色，设为透明
          if (r > threshold && g > threshold && b > threshold) {
            data[i + 3] = 0 // 设置alpha为0
          }
        }
        
        ctx.putImageData(imageData, 0, 0)
        
        // 转换为PNG
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('背景移除失败'))
            }
          },
          'image/png',
          1.0
        )
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 批量处理
   */
  async batchProcess(requests: ProcessingRequest[]): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = []
    
    // 限制并发数
    const concurrency = 3
    const batches = []
    
    for (let i = 0; i < requests.length; i += concurrency) {
      batches.push(requests.slice(i, i + concurrency))
    }
    
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map((request) => this.processImage(request))
      )
      results.push(...batchResults)
      
      // 短暂延迟，避免速率限制
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return results
  }

  /**
   * 获取服务状态
   */
  async getServiceStatus(): Promise<{
    removeBg: { enabled: boolean; available: boolean }
    volcengine: { enabled: boolean; available: boolean }
    local: { enabled: boolean; available: boolean }
  }> {
    const status = {
      removeBg: { enabled: this.config.removeBg.enabled, available: false },
      volcengine: { enabled: this.config.volcengine.enabled, available: false },
      local: { enabled: true, available: true },
    }

    // 测试 Remove.bg 连接
    if (status.removeBg.enabled) {
      try {
        const testResponse = await fetch(`${this.config.removeBg.endpoint}/v1.0/removebg`, {
          method: 'HEAD',
          headers: {
            'X-Api-Key': this.config.removeBg.apiKey,
          },
        })
        status.removeBg.available = testResponse.ok
      } catch (error) {
        status.removeBg.available = false
      }
    }

    // 测试火山引擎连接
    if (status.volcengine.enabled && this.volcengineService) {
      try {
        const stats = await this.volcengineService.getStatistics()
        status.volcengine.available = stats.totalProcessed >= 0 // 只要能获取统计信息就认为可用
      } catch (error) {
        status.volcengine.available = false
      }
    }

    return status
  }

  /**
   * 获取服务名称
   */
  private getServiceName(service: ServiceType): string {
    const names = {
      'remove-bg': 'Remove.bg',
      'volcengine': '火山引擎',
      'local': '本地处理',
    }
    return names[service]
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ServiceConfig>) {
    this.config = { ...this.config, ...newConfig }
    
    // 重新初始化火山引擎服务
    if (newConfig.volcengine) {
      try {
        this.volcengineService = getVolcengineService({
          ...this.config.volcengine,
          ...newConfig.volcengine,
        })
      } catch (error) {
        console.error('火山引擎服务重新初始化失败:', error)
      }
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): ServiceConfig {
    return { ...this.config }
  }
}

// 创建单例实例
let gatewayInstance: ServiceGateway | null = null

export const getServiceGateway = (config?: ServiceConfig) => {
  if (!gatewayInstance && config) {
    gatewayInstance = new ServiceGateway(config)
  }
  
  if (!gatewayInstance) {
    throw new Error('服务网关未初始化，请先提供配置')
  }
  
  return gatewayInstance
}

// React Hook
export const useServiceGateway = () => {
  return getServiceGateway()
}

// 默认配置
export const defaultServiceConfig: ServiceConfig = {
  removeBg: {
    apiKey: '',
    endpoint: 'https://api.remove.bg/v1.0',
    enabled: false,
  },
  volcengine: {
    accessKeyId: '',
    secretAccessKey: '',
    serviceId: '',
    region: 'cn-north-1',
    endpoint: 'https://imagex.volcengineapi.com',
    enabled: false,
  },
  fallbackToLocal: true,
  preferredService: 'volcengine',
}

export default ServiceGateway