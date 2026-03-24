import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useSettingsStore } from '@/stores/settingsStore'
import toast from 'react-hot-toast'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface FileMetadata {
  file_id: string
  url: string
  expires_at: string
  metadata: {
    filename: string
    size: number
    mime_type: string
    dimensions: {
      width: number
      height: number
    }
  }
}

export interface ProcessingResult {
  result_id: string
  url: string
  expires_at: string
  processing_time: number
  metadata: any
  layout_url?: string
  comparison_url?: string
  animation_url?: string
}

// 背景移除参数
export interface BackgroundRemovalParams {
  size?: 'auto' | 'preview' | 'full' | 'hd'
  format?: 'png' | 'jpg' | 'webp'
  bg_color?: 'transparent' | string
  edge_smoothness?: 'low' | 'medium' | 'high' | 'auto'
  hair_detail?: boolean
  shadow?: boolean
}

// 证件照参数
export interface IDPhotoParams {
  photo_type?: 'id_card' | 'passport' | 'visa' | 'driver_license' | 'custom'
  background?: {
    type: 'solid' | 'gradient' | 'custom_image'
    color?: string
    gradient?: {
      start: string
      end: string
      angle: number
    }
    custom_image?: string
  }
  size?: {
    type: '大一寸' | '小一寸' | '大两寸' | '小两寸' | '标准一寸' | '标准两寸' | 'custom'
    width_mm?: number
    height_mm?: number
    dpi?: 150 | 300 | 600
  }
  portrait?: {
    position: 'center' | { x: number; y: number }
    zoom: number
    beauty?: {
      enabled: boolean
      skin_smooth: number
      eye_brighten: number
      teeth_whiten: number
    }
  }
  output?: {
    format: 'jpg' | 'png'
    quality: number
    layout: 'single' | '4x6' | '8x10'
  }
}

// 背景替换参数
export interface BackgroundReplacementParams {
  composition?: {
    position: { x: number; y: number }
    scale: number
    rotation: number
    blend_mode: 'normal' | 'multiply' | 'screen' | 'overlay'
    edge_feathering: number
    shadow?: {
      enabled: boolean
      opacity: number
      blur: number
      offset: { x: number; y: number }
    }
  }
  lighting?: {
    match_lighting: boolean
    light_direction: number
    intensity: number
    temperature: number
  }
  color?: {
    match_color: boolean
    saturation: number
    contrast: number
    brightness: number
  }
  output?: {
    format: 'jpg' | 'png' | 'webp'
    quality: number
    resolution: number
  }
}

// 老照片修复参数
export interface OldPhotoRestorationParams {
  restoration_type?: 'basic' | 'colorization' | 'super_resolution' | 'full'
  basic_repair?: {
    scratch_removal: boolean
    stain_removal: boolean
    crease_removal: boolean
    missing_parts: boolean
    repair_strength: number
  }
  colorization?: {
    enabled: boolean
    color_model: 'realistic' | 'vintage' | 'modern'
    skin_tone: 'natural' | 'warm' | 'cool'
    environment_color: boolean
    color_intensity: number
  }
  super_resolution?: {
    enabled: boolean
    scale: 2 | 4 | 8
    detail_enhancement: number
    noise_reduction: number
    sharpness: number
  }
  face_enhancement?: {
    enabled: boolean
    face_restoration: boolean
    expression_enhancement: boolean
    age_progression: boolean
    enhancement_strength: number
  }
  animation?: {
    enabled: boolean
    animation_type: 'face_only' | 'full_scene'
    face_expressions: string[]
    background_motion: boolean
    animation_duration: number
    loop: boolean
  }
  output?: {
    format: 'jpg' | 'png' | 'gif' | 'mp4'
    quality: number
    include_original: boolean
    create_comparison: boolean
  }
}

class ApiService {
  private client: AxiosInstance
  private baseURL: string

  constructor() {
    const { apiConfig } = useSettingsStore.getState()
    this.baseURL = apiConfig.endpoint

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        const { apiConfig } = useSettingsStore.getState()
        if (apiConfig.apiKey) {
          config.headers['Authorization'] = `Bearer ${apiConfig.apiKey}`
        }
        
        // 添加请求时间戳
        config.headers['X-Request-Timestamp'] = Date.now()
        
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response
        
        if (!data.success) {
          toast.error(data.error?.message || '请求失败')
          return Promise.reject(new Error(data.error?.message || '请求失败'))
        }
        
        return response
      },
      (error) => {
        if (error.response) {
          const { status, data } = error.response
          
          switch (status) {
            case 400:
              toast.error(data?.error?.message || '请求参数错误')
              break
            case 401:
              toast.error('未授权，请重新登录')
              break
            case 403:
              toast.error('权限不足')
              break
            case 404:
              toast.error('资源不存在')
              break
            case 429:
              toast.error('请求过于频繁，请稍后再试')
              break
            case 500:
              toast.error('服务器内部错误')
              break
            case 502:
            case 503:
            case 504:
              toast.error('服务暂时不可用，请稍后再试')
              break
            default:
              toast.error(`请求失败: ${status}`)
          }
        } else if (error.request) {
          toast.error('网络连接失败，请检查网络设置')
        } else {
          toast.error('请求配置错误')
        }
        
        return Promise.reject(error)
      }
    )
  }

  // 健康检查
  async healthCheck(): Promise<any> {
    const response = await this.client.get<ApiResponse>('/health')
    return response.data.data
  }

  // 文件上传
  async uploadFile(file: File, type: string, purpose: string): Promise<FileMetadata> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    formData.append('purpose', purpose)
    
    const { apiConfig } = useSettingsStore.getState()
    
    // 检查文件大小
    if (file.size > apiConfig.maxFileSize) {
      throw new Error(`文件大小超过限制 (最大 ${apiConfig.maxFileSize / 1024 / 1024}MB)`)
    }
    
    // 检查文件格式
    if (!apiConfig.allowedFormats.includes(file.type)) {
      throw new Error('不支持的文件格式')
    }
    
    const response = await this.client.post<ApiResponse<FileMetadata>>(
      '/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          )
          console.log(`上传进度: ${progress}%`)
        },
      }
    )
    
    return response.data.data!
  }

  // 背景移除
  async backgroundRemoval(fileId: string, params: BackgroundRemovalParams = {}): Promise<ProcessingResult> {
    const response = await this.client.post<ApiResponse<ProcessingResult>>(
      '/background-removal',
      {
        file_id: fileId,
        parameters: params
      }
    )
    
    return response.data.data!
  }

  // 证件照制作
  async idPhotoProcessing(fileId: string, params: IDPhotoParams = {}): Promise<ProcessingResult> {
    const response = await this.client.post<ApiResponse<ProcessingResult>>(
      '/id-photo',
      {
        file_id: fileId,
        parameters: params
      }
    )
    
    return response.data.data!
  }

  // 背景替换
  async backgroundReplacement(foregroundFileId: string, backgroundFileId: string, params: BackgroundReplacementParams = {}): Promise<ProcessingResult> {
    const response = await this.client.post<ApiResponse<ProcessingResult>>(
      '/background-replacement',
      {
        foreground_file_id: foregroundFileId,
        background_file_id: backgroundFileId,
        parameters: params
      }
    )
    
    return response.data.data!
  }

  // 老照片修复
  async photoRestoration(fileId: string, params: OldPhotoRestorationParams = {}): Promise<ProcessingResult> {
    const response = await this.client.post<ApiResponse<ProcessingResult>>(
      '/photo-restoration',
      {
        file_id: fileId,
        parameters: params
      }
    )
    
    return response.data.data!
  }

  // 测试API连接
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck()
      return true
    } catch (error) {
      console.error('API连接测试失败:', error)
      return false
    }
  }
}

// 创建单例实例
export const apiService = new ApiService()

// React Hook 使用示例
export const useApi = () => {
  return apiService
}