/**
 * 图片处理工具函数
 */

export interface ImageInfo {
  width: number
  height: number
  aspectRatio: number
  size: number
  type: string
  name: string
}

export interface ResizeOptions {
  width?: number
  height?: number
  maintainAspectRatio: boolean
  quality?: number
}

export interface CompressionOptions {
  quality: number // 0-100
  maxWidth?: number
  maxHeight?: number
  format: 'jpeg' | 'png' | 'webp'
}

/**
 * 获取图片信息
 */
export async function getImageInfo(file: File): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      const info: ImageInfo = {
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height,
        size: file.size,
        type: file.type,
        name: file.name,
      }
      
      URL.revokeObjectURL(url)
      resolve(info)
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('无法加载图片'))
    }
    
    img.src = url
  })
}

/**
 * 压缩图片
 */
export async function compressImage(
  file: File,
  options: CompressionOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('无法创建画布上下文'))
        return
      }
      
      // 计算调整后的尺寸
      let { width, height } = img
      
      if (options.maxWidth && width > options.maxWidth) {
        height = (height * options.maxWidth) / width
        width = options.maxWidth
      }
      
      if (options.maxHeight && height > options.maxHeight) {
        width = (width * options.maxHeight) / height
        height = options.maxHeight
      }
      
      // 设置画布尺寸
      canvas.width = width
      canvas.height = height
      
      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height)
      
      // 转换为Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('图片转换失败'))
          }
        },
        `image/${options.format}`,
        options.quality / 100
      )
      
      URL.revokeObjectURL(url)
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('无法加载图片'))
    }
    
    img.src = url
  })
}

/**
 * 调整图片尺寸
 */
export async function resizeImage(
  file: File,
  options: ResizeOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('无法创建画布上下文'))
        return
      }
      
      let { width, height } = img
      
      // 计算调整后的尺寸
      if (options.maintainAspectRatio) {
        if (options.width && options.height) {
          // 保持宽高比，以较小的一边为准
          const widthRatio = options.width / width
          const heightRatio = options.height / height
          const ratio = Math.min(widthRatio, heightRatio)
          
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        } else if (options.width) {
          height = Math.round((height * options.width) / width)
          width = options.width
        } else if (options.height) {
          width = Math.round((width * options.height) / height)
          height = options.height
        }
      } else {
        width = options.width || width
        height = options.height || height
      }
      
      // 设置画布尺寸
      canvas.width = width
      canvas.height = height
      
      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height)
      
      // 转换为Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('图片转换失败'))
          }
        },
        file.type,
        options.quality ? options.quality / 100 : 0.92
      )
      
      URL.revokeObjectURL(url)
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('无法加载图片'))
    }
    
    img.src = url
  })
}

/**
 * 转换图片格式
 */
export async function convertImageFormat(
  file: File,
  format: 'jpeg' | 'png' | 'webp',
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('无法创建画布上下文'))
        return
      }
      
      canvas.width = img.width
      canvas.height = img.height
      
      // 绘制图片
      ctx.drawImage(img, 0, 0)
      
      // 转换为指定格式
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('图片格式转换失败'))
          }
        },
        `image/${format}`,
        quality
      )
      
      URL.revokeObjectURL(url)
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('无法加载图片'))
    }
    
    img.src = url
  })
}

/**
 * 创建缩略图
 */
export async function createThumbnail(
  file: File,
  maxSize = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('无法创建画布上下文'))
        return
      }
      
      // 计算缩略图尺寸
      let { width, height } = img
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // 绘制缩略图
      ctx.drawImage(img, 0, 0, width, height)
      
      // 转换为Data URL
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7)
      URL.revokeObjectURL(url)
      resolve(thumbnailUrl)
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('无法加载图片'))
    }
    
    img.src = url
  })
}

/**
 * 验证图片文件
 */
export function validateImageFile(file: File, maxSizeMB = 10): string | null {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return '不支持的文件格式，请上传 JPEG、PNG、WebP 或 GIF 图片'
  }
  
  // 检查文件大小
  const maxSize = maxSizeMB * 1024 * 1024
  if (file.size > maxSize) {
    return `文件大小超过限制 (最大 ${maxSizeMB}MB)`
  }
  
  // 检查文件名
  if (file.name.length > 255) {
    return '文件名过长'
  }
  
  return null
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * 生成文件名
 */
export function generateFilename(
  originalName: string,
  suffix: string,
  format: string
): string {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
  const extension = format.startsWith('image/') ? format.split('/')[1] : format
  return `${nameWithoutExt}_${suffix}.${extension}`
}