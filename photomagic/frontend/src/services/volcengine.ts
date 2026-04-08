/**
 * 火山引擎 ImageX 服务集成
 * 文档: https://www.volcengine.com/docs/508/67005
 */

import axios, { AxiosInstance } from 'axios'

export interface VeLMagicXConfig {
  accessKeyId: string
  secretAccessKey: string
  serviceId: string
  region?: string
  endpoint?: string
  timeout?: number
}

export interface ImageProcessOptions {
  // 基础处理选项
  format?: 'jpg' | 'png' | 'webp' | 'gif' | 'heic'
  quality?: number // 1-100
  resize?: {
    width?: number
    height?: number
    mode?: 'lfit' | 'mfit' | 'fill' | 'pad' | 'fixed'
    limit?: boolean
  }
  crop?: {
    x: number
    y: number
    width: number
    height: number
  }
  
  // AI增强选项
  enhance?: {
    type: 'super_resolution' | 'deblur' | 'denoise' | 'color_enhance'
    level?: 'low' | 'medium' | 'high'
  }
  
  // 老照片修复选项
  restoration?: {
    scratch_removal?: boolean
    color_restoration?: boolean
    super_resolution?: boolean
  }
  
  // 水印选项
  watermark?: {
    type: 'text' | 'image'
    text?: string
    imageUrl?: string
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
    opacity?: number
    scale?: number
  }
}

export interface ProcessResult {
  success: boolean
  url?: string
  width?: number
  height?: number
  size?: number
  format?: string
  processingTime?: number
  error?: string
}

export interface FaceDetectionResult {
  success: boolean
  faces: Array<{
    boundingBox: {
      x: number
      y: number
      width: number
      height: number
    }
    landmarks?: Array<{ x: number; y: number }>
    attributes?: {
      age?: number
      gender?: 'male' | 'female'
      expression?: 'happy' | 'sad' | 'neutral' | 'angry'
      glasses?: boolean
      mask?: boolean
      headPose?: {
        pitch: number
        yaw: number
        roll: number
      }
    }
    quality?: {
      blur: number
      illumination: number
      completeness: number
    }
  }>
  imageWidth: number
  imageHeight: number
}

export interface IDPhotoOptions {
  country: 'china' | 'usa' | 'eu' | 'japan' | 'korea' | 'custom'
  type: 'passport' | 'visa' | 'id_card' | 'driver_license'
  size: {
    width: number // mm
    height: number // mm
    dpi: number // 通常300或600
  }
  backgroundColor: string // hex color
  clothing?: 'formal' | 'casual'
  requirements?: {
    noGlasses?: boolean
    noHat?: boolean
    neutralExpression?: boolean
    earsVisible?: boolean
  }
}

class VeLMagicXService {
  private client: AxiosInstance
  private config: VeLMagicXConfig
  private serviceId: string

  constructor(config: VeLMagicXConfig) {
    this.config = config
    this.serviceId = config.serviceId
    
    const endpoint = config.endpoint || 'https://cv.cn-beijing.volcengineapi.com'
    
    this.client = axios.create({
      baseURL: endpoint,
      timeout: config.timeout || 180000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    // 添加签名中间件
    this.client.interceptors.request.use(
      (requestConfig) => {
        // 火山引擎需要特定的签名算法
        // 这里简化处理，实际需要实现完整的签名逻辑
        const timestamp = Math.floor(Date.now() / 1000)
        
        // 简化的签名示例，实际需要按照火山引擎文档实现
        requestConfig.headers['X-Date'] = timestamp.toString()
        
        return requestConfig
      },
      (error) => Promise.reject(error)
    )
  }

  /**
   * 上传图片到火山引擎
   */
  async uploadImage(file: File | Buffer): Promise<{ url: string; key: string }> {
    const formData = new FormData()
    
    if (file instanceof File) {
      formData.append('file', file)
    } else {
      const blob = new Blob([file])
      formData.append('file', blob, 'image.jpg')
    }
    
    formData.append('serviceId', this.serviceId)
    
    try {
      const response = await this.client.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      return {
        url: response.data.url,
        key: response.data.key,
      }
    } catch (error) {
      console.error('火山引擎上传失败:', error)
      throw new Error('图片上传失败')
    }
  }

  /**
   * 基础图片处理
   */
  async processImage(
    imageUrl: string,
    options: ImageProcessOptions
  ): Promise<ProcessResult> {
    const params = new URLSearchParams()
    
    // 添加基础处理参数
    if (options.format) {
      params.append('format', options.format)
    }
    
    if (options.quality) {
      params.append('quality', options.quality.toString())
    }
    
    if (options.resize) {
      const { width, height, mode = 'lfit', limit } = options.resize
      if (width) params.append('w', width.toString())
      if (height) params.append('h', height.toString())
      params.append('m', mode)
      if (limit) params.append('limit', '1')
    }
    
    if (options.crop) {
      const { x, y, width, height } = options.crop
      params.append('crop', `${x},${y},${width},${height}`)
    }
    
    // 构建处理URL
    const processedUrl = `${imageUrl}?${params.toString()}`
    
    try {
      // 这里实际是调用火山引擎的处理接口
      // 简化实现，直接返回处理后的URL
      return {
        success: true,
        url: processedUrl,
        processingTime: 500, // 模拟处理时间
      }
    } catch (error) {
      console.error('图片处理失败:', error)
      return {
        success: false,
        error: '图片处理失败',
      }
    }
  }

  /**
   * AI图像增强（超分辨率、去模糊等）
   */
  async enhanceImage(
    imageUrl: string,
    options: ImageProcessOptions['enhance']
  ): Promise<ProcessResult> {
    if (!options) {
      throw new Error('增强选项不能为空')
    }
    
    try {
      // 调用VeLMagicX智能媒体增强API
      const response = await this.client.post('/v1/media/enhance', {
        service_id: this.serviceId,
        image_url: imageUrl,
        enhance_type: options.type,
        enhance_level: options.level || 'medium',
      })
      
      return {
        success: true,
        url: response.data.url,
        width: response.data.width,
        height: response.data.height,
        processingTime: response.data.processing_time,
      }
    } catch (error) {
      console.error('AI图像增强失败:', error)
      return {
        success: false,
        error: 'AI图像增强失败',
      }
    }
  }

  /**
   * 老照片修复
   */
  async restoreOldPhoto(
    imageUrl: string,
    options: ImageProcessOptions['restoration']
  ): Promise<ProcessResult> {
    try {
      // 调用VeLMagicX图像修复API
      const response = await this.client.post('/v1/media/restore', {
        service_id: this.serviceId,
        image_url: imageUrl,
        scratch_removal: options?.scratch_removal ?? true,
        color_restoration: options?.color_restoration ?? true,
        super_resolution: options?.super_resolution ?? true,
      })
      
      return {
        success: true,
        url: response.data.url,
        width: response.data.width,
        height: response.data.height,
        processingTime: response.data.processing_time,
      }
    } catch (error) {
      console.error('老照片修复失败:', error)
      return {
        success: false,
        error: '老照片修复失败',
      }
    }
  }

  /**
   * 人脸检测
   */
  async detectFaces(imageUrl: string): Promise<FaceDetectionResult> {
    try {
      // 调用VeLMagicX人脸分析API
      const response = await this.client.post('/v1/face/analyze', {
        service_id: this.serviceId,
        image_url: imageUrl,
        max_face_num: 10,
        face_field: 'age,gender,expression,glasses,mask,headpose,quality',
      })
      
      return {
        success: true,
        faces: response.data.faces.map((face: any) => ({
          boundingBox: {
            x: face.location.left,
            y: face.location.top,
            width: face.location.width,
            height: face.location.height,
          },
          landmarks: face.landmark?.map((point: any) => ({
            x: point.x,
            y: point.y,
          })),
          attributes: {
            age: face.age,
            gender: face.gender,
            expression: face.expression,
            glasses: face.glasses,
            mask: face.mask,
            headPose: face.headpose,
          },
          quality: {
            blur: face.blur,
            illumination: face.illumination,
            completeness: face.completeness,
          },
        })),
        imageWidth: response.data.image_width,
        imageHeight: response.data.image_height,
      }
    } catch (error) {
      console.error('人脸检测失败:', error)
      return {
        success: false,
        faces: [],
        imageWidth: 0,
        imageHeight: 0,
      }
    }
  }

  /**
   * 生成证件照
   */
  async createIDPhoto(
    imageUrl: string,
    options: IDPhotoOptions
  ): Promise<ProcessResult> {
    try {
      // 1. 人脸检测
      const faceResult = await this.detectFaces(imageUrl)
      if (!faceResult.success || faceResult.faces.length === 0) {
        return {
          success: false,
          error: '未检测到人脸',
        }
      }
      
      const mainFace = faceResult.faces[0]
      
      // 2. 检查证件照要求
      const requirements = options.requirements || {}
      const violations: string[] = []
      
      if (requirements.noGlasses && mainFace.attributes?.glasses) {
        violations.push('请摘掉眼镜')
      }
      
      if (requirements.noHat) {
        // 这里需要检测是否戴帽子
      }
      
      if (requirements.neutralExpression && mainFace.attributes?.expression !== 'neutral') {
        violations.push('请保持中性表情')
      }
      
      if (requirements.earsVisible) {
        // 检查耳朵是否可见
      }
      
      if (violations.length > 0) {
        return {
          success: false,
          error: `证件照要求不符: ${violations.join('; ')}`,
        }
      }
      
      // 3. 计算裁剪参数
      const { boundingBox } = mainFace
      const { width: imageWidth, height: imageHeight } = faceResult
      
      // 根据证件照标准计算裁剪区域
      const cropParams = this.calculateIDPhotoCrop(
        boundingBox,
        imageWidth,
        imageHeight,
        options
      )
      
      // 4. 处理图片
      const processResult = await this.processImage(imageUrl, {
        crop: cropParams,
        resize: {
          width: Math.round(options.size.width * options.size.dpi / 25.4),
          height: Math.round(options.size.height * options.size.dpi / 25.4),
          mode: 'fixed',
        },
        format: 'jpg',
        quality: 100,
      })
      
      if (!processResult.success) {
        return processResult
      }
      
      // 5. 添加背景色（如果需要）
      if (options.backgroundColor !== 'transparent') {
        // 这里需要调用背景替换API
        // 简化实现，返回处理后的图片
      }
      
      return {
        success: true,
        url: processResult.url,
        width: processResult.width,
        height: processResult.height,
        processingTime: (processResult.processingTime || 0) + 1000, // 加上证件照处理时间
      }
    } catch (error) {
      console.error('证件照生成失败:', error)
      return {
        success: false,
        error: '证件照生成失败',
      }
    }
  }

  /**
   * 计算证件照裁剪参数
   */
  private calculateIDPhotoCrop(
    faceBox: { x: number; y: number; width: number; height: number },
    imageWidth: number,
    imageHeight: number,
    options: IDPhotoOptions
  ) {
    // 证件照标准：头部占照片高度的2/3到3/4
    const headHeightRatio = 0.7
    const targetHeadHeight = faceBox.height / headHeightRatio
    
    // 计算裁剪区域
    const cropWidth = targetHeadHeight * 0.8 // 宽度为头部高度的0.8倍
    const cropHeight = targetHeadHeight * 1.25 // 高度为头部高度的1.25倍
    
    // 以人脸为中心
    const cropX = Math.max(0, faceBox.x + faceBox.width / 2 - cropWidth / 2)
    const cropY = Math.max(0, faceBox.y + faceBox.height / 2 - cropHeight * 0.4)
    
    // 确保不超出图片边界
    const finalCropX = Math.min(cropX, imageWidth - cropWidth)
    const finalCropY = Math.min(cropY, imageHeight - cropHeight)
    
    return {
      x: Math.round(finalCropX),
      y: Math.round(finalCropY),
      width: Math.round(Math.min(cropWidth, imageWidth)),
      height: Math.round(Math.min(cropHeight, imageHeight)),
    }
  }

  /**
   * 批量处理图片
   */
  async batchProcess(
    imageUrls: string[],
    options: ImageProcessOptions
  ): Promise<ProcessResult[]> {
    const promises = imageUrls.map((url) => this.processImage(url, options))
    return Promise.all(promises)
  }

  /**
   * 获取处理统计信息
   */
  async getStatistics(): Promise<{
    totalProcessed: number
    totalSize: number
    averageProcessingTime: number
  }> {
    try {
      const response = await this.client.get('/v1/statistics', {
        params: {
          service_id: this.serviceId,
        },
      })
      
      return {
        totalProcessed: response.data.total_processed,
        totalSize: response.data.total_size,
        averageProcessingTime: response.data.avg_processing_time,
      }
    } catch (error) {
      console.error('获取统计信息失败:', error)
      return {
        totalProcessed: 0,
        totalSize: 0,
        averageProcessingTime: 0,
      }
    }
  }
}

// 创建单例实例
let velmagicxInstance: VeLMagicXService | null = null

export const getVeLMagicXService = (config?: VeLMagicXConfig) => {
  if (!velmagicxInstance && config) {
    velmagicxInstance = new VeLMagicXService(config)
  }
  
  if (!velmagicxInstance) {
    throw new Error('VeLMagicX服务未初始化，请先提供配置')
  }
  
  return velmagicxInstance
}

// 默认导出
export default VeLMagicXService