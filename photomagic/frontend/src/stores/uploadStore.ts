import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  previewUrl?: string
  uploadedAt: Date
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export interface ProcessingOptions {
  quality: number // 1-100
  format: 'png' | 'jpg' | 'webp'
  removeBackground: boolean
  enhanceQuality: boolean
  resizeTo?: {
    width?: number
    height?: number
    maintainAspectRatio: boolean
  }
}

interface UploadState {
  // 上传状态
  files: UploadedFile[]
  isUploading: boolean
  uploadProgress: number
  
  // 处理选项
  processingOptions: ProcessingOptions
  
  // 处理结果
  processedFiles: UploadedFile[]
  isProcessing: boolean
  processingProgress: number
  
  // 历史记录
  history: Array<{
    id: string
    originalFile: UploadedFile
    processedFile: UploadedFile
    options: ProcessingOptions
    processedAt: Date
  }>
  
  // Actions
  addFiles: (files: File[]) => void
  removeFile: (id: string) => void
  updateFileStatus: (id: string, status: UploadedFile['status'], error?: string) => void
  clearFiles: () => void
  
  setProcessingOptions: (options: Partial<ProcessingOptions>) => void
  resetProcessingOptions: () => void
  
  startProcessing: () => void
  completeProcessing: (processedFile: UploadedFile) => void
  cancelProcessing: () => void
  
  addToHistory: (originalFile: UploadedFile, processedFile: UploadedFile, options: ProcessingOptions) => void
  clearHistory: () => void
  
  // UI状态
  selectedFileId: string | null
  setSelectedFile: (id: string | null) => void
}

const defaultProcessingOptions: ProcessingOptions = {
  quality: 85,
  format: 'png',
  removeBackground: true,
  enhanceQuality: true,
  resizeTo: {
    maintainAspectRatio: true,
  },
}

export const useUploadStore = create<UploadState>()(
  persist(
    (set, get) => ({
      files: [],
      isUploading: false,
      uploadProgress: 0,
      
      processingOptions: defaultProcessingOptions,
      
      processedFiles: [],
      isProcessing: false,
      processingProgress: 0,
      
      history: [],
      
      selectedFileId: null,
      
      addFiles: (newFiles) => {
        const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          uploadedAt: new Date(),
          status: 'uploading',
        }))
        
        set((state) => ({
          files: [...state.files, ...uploadedFiles],
          isUploading: true,
          uploadProgress: 0,
        }))
        
        // 模拟上传进度
        const interval = setInterval(() => {
          set((state) => {
            const newProgress = Math.min(state.uploadProgress + 10, 100)
            const isComplete = newProgress === 100
            
            if (isComplete) {
              clearInterval(interval)
              return {
                uploadProgress: 100,
                isUploading: false,
                files: state.files.map((f) => ({
                  ...f,
                  status: 'success' as const,
                })),
              }
            }
            
            return { uploadProgress: newProgress }
          })
        }, 200)
      },
      
      removeFile: (id) => {
        set((state) => {
          const file = state.files.find((f) => f.id === id)
          if (file?.url) {
            URL.revokeObjectURL(file.url)
          }
          if (file?.previewUrl) {
            URL.revokeObjectURL(file.previewUrl)
          }
          
          return {
            files: state.files.filter((f) => f.id !== id),
            selectedFileId: state.selectedFileId === id ? null : state.selectedFileId,
          }
        })
      },
      
      updateFileStatus: (id, status, error) => {
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id ? { ...file, status, error } : file
          ),
        }))
      },
      
      clearFiles: () => {
        set((state) => {
          // 清理所有URL
          state.files.forEach((file) => {
            if (file.url) URL.revokeObjectURL(file.url)
            if (file.previewUrl) URL.revokeObjectURL(file.previewUrl)
          })
          
          return {
            files: [],
            selectedFileId: null,
            isUploading: false,
            uploadProgress: 0,
          }
        })
      },
      
      setProcessingOptions: (options) => {
        set((state) => ({
          processingOptions: { ...state.processingOptions, ...options },
        }))
      },
      
      resetProcessingOptions: () => {
        set({ processingOptions: defaultProcessingOptions })
      },
      
      startProcessing: () => {
        set({
          isProcessing: true,
          processingProgress: 0,
          processedFiles: [],
        })
        
        // 模拟处理进度
        const interval = setInterval(() => {
          set((state) => {
            const newProgress = Math.min(state.processingProgress + 5, 100)
            const isComplete = newProgress === 100
            
            if (isComplete) {
              clearInterval(interval)
              return {
                processingProgress: 100,
                isProcessing: false,
              }
            }
            
            return { processingProgress: newProgress }
          })
        }, 200)
      },
      
      completeProcessing: (processedFile) => {
        set((state) => ({
          processedFiles: [...state.processedFiles, processedFile],
        }))
      },
      
      cancelProcessing: () => {
        set({
          isProcessing: false,
          processingProgress: 0,
        })
      },
      
      addToHistory: (originalFile, processedFile, options) => {
        const historyItem = {
          id: crypto.randomUUID(),
          originalFile,
          processedFile,
          options,
          processedAt: new Date(),
        }
        
        set((state) => ({
          history: [historyItem, ...state.history].slice(0, 50), // 保留最近50条
        }))
      },
      
      clearHistory: () => {
        set({ history: [] })
      },
      
      setSelectedFile: (id) => {
        set({ selectedFileId: id })
      },
    }),
    {
      name: 'photomagic-upload-store',
      partialize: (state) => ({
        processingOptions: state.processingOptions,
        history: state.history,
      }),
    }
  )
)