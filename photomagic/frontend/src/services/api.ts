import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { toast } from 'react-hot-toast'
import { useSettingsStore } from '@/stores/settingsStore'

// API 响应基础接口
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  message?: string
}

// 文件元数据接口
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
  storage: {
    provider: string
    key: string
  }
  type: string
  purpose: string
}

// 图片处理参数接口
export interface BackgroundRemovalParams {
  model?: 'u2net' | 'modnet' | 'bria'
  alpha_matting?: boolean
  background_color?: string
  edge_feather?: number
  output_format?: 'png' | 'webp'
}

export interface IDPhotoParams {
  size_type?: 'one_inch' | 'two_inch' | 'small_one_inch' | 'small_two_inch' | 'custom'
  custom_size?: {
    width: number
    height: number
  }
  background_color?: 'white' | 'red' | 'blue' | 'transparent'
  dpi?: 300 | 600
  crop_style?: 'standard' | 'tight' | 'loose'
  enhance?: boolean
}

export interface BackgroundReplacementParams {
  background_type?: 'solid_color' | 'gradient' | 'image' | 'template'
  background_value?: string
  blend_mode?: 'normal' | 'multiply' | 'screen'
  shadow?: boolean
  reflection?: boolean
}

export interface PhotoRestorationParams {
  restoration_mode?: 'auto' | 'manual'
  issues?: string[]
  enhancement_level?: 1 | 2 | 3 | 4 | 5
  colorize?: boolean
  denoise?: boolean
  sharpen?: boolean
  repair_scratches?: boolean
}

export interface ProcessingResult {
  result_id: string
  url: string
  expires_at: string
  processing_time: number
  metadata: {
    original_size?: {
      width: number
      height: number
    }
    processed_size?: {
      width: number
      height: number
    }
    file_size?: number
    format?: string
    parameters?: any
    note?: string
  }
}

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        const timestamp = Date.now()
        config.headers['X-Request-Timestamp'] = timestamp.toString()
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error: AxiosError<ApiResponse>) => {
        if (error.response) {
          const status = error.response.status
          const data = error.response.data
          
          switch (status) {
            case 400:
              toast.error(data?.error?.message || '请求参数错误')
              break
            case 401:
              toast.error('未授权访问，请重新登录')
              break
            case 403:
              toast.error('拒绝访问')
              break
            case 404:
              toast.error('请求的资源不存在')
              break
            case 429:
              toast.error('请求过于频繁，请稍后再试')
              break
            case 500:
              toast.error(data?.error?.message || '服务器内部错误')
              break
            case 502:
              toast.error('网关错误，请稍后再试')
              break
            case 503:
              toast.error('服务暂时不可用，请稍后再试')
              break
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

  // 文件上传（优先使用原始二进制上传，避免 multipart 在 Pages Functions 下不稳定）
  async uploadFile(file: File, type: string, purpose: string): Promise<FileMetadata> {
    const { apiConfig } = useSettingsStore.getState()

    if (!(file instanceof File)) {
      console.error('[uploadFile] invalid file object:', file)
      throw new Error('图片文件不存在或已失效，请重新选择图片后再试')
    }

    console.log('[uploadFile] file info:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      isFileInstance: file instanceof File,
    })
    
    // 检查文件大小
    if (file.size > apiConfig.maxFileSize) {
      throw new Error(`文件大小超过限制 (最大 ${apiConfig.maxFileSize / 1024 / 1024}MB)`)
    }

    if (file.size <= 0) {
      throw new Error('图片文件不存在或内容为空，请重新选择图片后再试')
    }
    
    // 检查文件格式
    if (!apiConfig.allowedFormats.includes(file.type)) {
      throw new Error('不支持的文件格式')
    }

    const safeFileName = file.name || `upload-${Date.now()}.bin`

    const response = await this.client.post<ApiResponse<FileMetadata>>(
      '/upload',
      file,
      {
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'X-File-Name': encodeURIComponent(safeFileName),
          'X-Upload-Type': type,
          'X-Upload-Purpose': purpose,
        },
        transformRequest: [(data) => data],
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || file.size || 1)
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
  async photoRestoration(fileId: string, params: PhotoRestorationParams = {}): Promise<ProcessingResult> {
    const response = await this.client.post<ApiResponse<ProcessingResult>>(
      '/photo-restoration',
      {
        file_id: fileId,
        parameters: params
      }
    )
    
    return response.data.data!
  }
}

export const apiService = new ApiService()
export default apiService
