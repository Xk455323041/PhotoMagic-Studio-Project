import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { toast } from 'react-hot-toast'
import { useSettingsStore } from '@/stores/settingsStore'

function isBrowserFile(value: unknown): value is File {
  if (!value || typeof value !== 'object') return false

  const fileCtor = (globalThis as any)?.File
  if (typeof fileCtor === 'function') {
    try {
      return value instanceof fileCtor
    } catch {
      // fall through to duck-typing
    }
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.name === 'string' &&
    typeof candidate.size === 'number' &&
    typeof candidate.type === 'string' &&
    typeof candidate.arrayBuffer === 'function' &&
    typeof candidate.slice === 'function'
  )
}

function toLatin1SafeHeaderValue(value: string) {
  return (
    value
      .normalize('NFKD')
      .replace(/[^\x20-\x7E]/g, '_')
      .slice(0, 180) || `upload-${Date.now()}.bin`
  )
}

function toAsciiQueryValue(value: string) {
  return encodeURIComponent(
    value
      .normalize('NFKD')
      .replace(/[^\x20-\x7E]/g, '_')
      .slice(0, 180)
  )
}

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

export interface BackgroundRemovalParams {
  model?: 'u2net' | 'modnet' | 'bria'
  alpha_matting?: boolean
  background_color?: string
  edge_feather?: number
  output_format?: 'png' | 'webp'
}

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
    [key: string]: any
  }
  layout_url?: string
  comparison_url?: string
  animation_url?: string
}

export interface IDPhotoTaskResult {
  result_id: string
  url: string
  layout_url?: string
  expires_at: string
  processing_time: number
  metadata?: any
}

export interface IDPhotoTaskResponse {
  task_id: string
  file_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  started_at?: string
  completed_at?: string
  result?: IDPhotoTaskResult
  error?: string
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
    this.client.interceptors.request.use(
      (config) => {
        const timestamp = Date.now()
        config.headers['X-Request-Timestamp'] = timestamp.toString()
        return config
      },
      (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
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

  async healthCheck(): Promise<any> {
    const response = await this.client.get<ApiResponse>('/health')
    return response.data.data
  }

  async uploadFile(file: File, type: string, purpose: string): Promise<FileMetadata> {
    const { apiConfig } = useSettingsStore.getState()

    if (!isBrowserFile(file)) {
      console.error('[uploadFile] invalid file object:', file)
      throw new Error('图片文件不存在或已失效，请重新选择图片后再试')
    }

    console.log('[uploadFile] file info:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      isFileInstance: isBrowserFile(file),
    })

    if (file.size > apiConfig.maxFileSize) {
      throw new Error(`文件大小超过限制 (最大 ${apiConfig.maxFileSize / 1024 / 1024}MB)`)
    }

    if (file.size <= 0) {
      throw new Error('图片文件不存在或内容为空，请重新选择图片后再试')
    }

    if (!apiConfig.allowedFormats.includes(file.type)) {
      throw new Error('不支持的文件格式')
    }

    const safeFileName = file.name || `upload-${Date.now()}.bin`
    const headerSafeFileName = toLatin1SafeHeaderValue(safeFileName)
    const uploadTypeSafe = toLatin1SafeHeaderValue(type || 'file')
    const uploadPurposeSafe = toLatin1SafeHeaderValue(purpose || 'upload')
    const fileNameQuery = toAsciiQueryValue(safeFileName)
    const typeQuery = toAsciiQueryValue(type || 'file')
    const purposeQuery = toAsciiQueryValue(purpose || 'upload')

    const response = await this.client.post<ApiResponse<FileMetadata>>(
      `/upload?filename=${fileNameQuery}&type=${typeQuery}&purpose=${purposeQuery}`,
      file,
      {
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'X-File-Name': headerSafeFileName,
          'X-Upload-Type': uploadTypeSafe,
          'X-Upload-Purpose': uploadPurposeSafe,
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

  async createIdPhotoTask(fileId: string, params: IDPhotoParams = {}): Promise<IDPhotoTaskResponse> {
    const response = await this.client.post<ApiResponse<IDPhotoTaskResponse>>(
      '/id-photo/tasks',
      {
        file_id: fileId,
        parameters: params
      }
    )

    return response.data.data!
  }

  async getIdPhotoTask(taskId: string): Promise<IDPhotoTaskResponse> {
    const response = await this.client.get<ApiResponse<IDPhotoTaskResponse>>(
      `/id-photo/tasks/${encodeURIComponent(taskId)}`
    )

    return response.data.data!
  }

  async waitForIdPhotoTask(
    taskId: string,
    options: { intervalMs?: number; timeoutMs?: number } = {}
  ): Promise<ProcessingResult> {
    const intervalMs = options.intervalMs ?? 2000
    const timeoutMs = options.timeoutMs ?? 180000
    const start = Date.now()

    while (true) {
      const task = await this.getIdPhotoTask(taskId)

      if (task.status === 'completed' && task.result) {
        return {
          result_id: task.result.result_id,
          url: task.result.url,
          layout_url: task.result.layout_url,
          expires_at: task.result.expires_at,
          processing_time: task.result.processing_time,
          metadata: task.result.metadata || {},
        }
      }

      if (task.status === 'failed') {
        throw new Error(task.error || '证件照处理失败')
      }

      if (Date.now() - start > timeoutMs) {
        throw new Error('证件照处理超时，请稍后重试')
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }
  }

  async idPhotoProcessing(fileId: string, params: IDPhotoParams = {}): Promise<ProcessingResult> {
    const task = await this.createIdPhotoTask(fileId, params)
    return await this.waitForIdPhotoTask(task.task_id)
  }

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

  async downloadResult(resultId: string): Promise<Blob> {
    const response = await this.client.get(`/results/${resultId}`, {
      responseType: 'blob',
      headers: {
        Accept: 'image/png,image/*,*/*',
      },
    })

    return response.data as Blob
  }

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
