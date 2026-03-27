import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserSettings {
  // 界面设置
  theme: 'light' | 'dark' | 'system'
  language: 'zh-CN' | 'en-US'
  fontSize: 'small' | 'medium' | 'large'
  reduceAnimations: boolean
  
  // 图片处理设置
  defaultQuality: number // 1-100
  defaultFormat: 'png' | 'jpg' | 'webp'
  autoRemoveBackground: boolean
  autoEnhanceQuality: boolean
  keepOriginalSize: boolean
  
  // 存储设置
  autoSaveProcessed: boolean
  saveLocation: 'local' | 'cloud'
  maxHistoryItems: number // 0 = 无限制
  
  // 隐私设置
  allowAnalytics: boolean
  allowErrorReporting: boolean
  clearHistoryOnExit: boolean
  
  // 通知设置
  enableNotifications: boolean
  notifyOnComplete: boolean
  notifyOnError: boolean
  
  // 快捷键设置
  shortcuts: Record<string, string>
}

export interface ApiConfig {
  endpoint: string
  apiKey?: string
  timeout: number // 毫秒
  maxFileSize: number // 字节
  allowedFormats: string[]
  enableCompression: boolean
  retryAttempts: number
}

interface SettingsState {
  settings: UserSettings
  apiConfig: ApiConfig
  isInitialized: boolean
  
  // Actions
  updateSettings: (updates: Partial<UserSettings>) => void
  resetSettings: () => void
  
  updateApiConfig: (updates: Partial<ApiConfig>) => void
  resetApiConfig: () => void
  
  initialize: () => void
}

const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'zh-CN',
  fontSize: 'medium',
  reduceAnimations: false,
  
  defaultQuality: 85,
  defaultFormat: 'png',
  autoRemoveBackground: true,
  autoEnhanceQuality: true,
  keepOriginalSize: true,
  
  autoSaveProcessed: true,
  saveLocation: 'local',
  maxHistoryItems: 50,
  
  allowAnalytics: true,
  allowErrorReporting: true,
  clearHistoryOnExit: false,
  
  enableNotifications: true,
  notifyOnComplete: true,
  notifyOnError: true,
  
  shortcuts: {
    upload: 'Ctrl+U',
    download: 'Ctrl+S',
    settings: 'Ctrl+,',
    toggleTheme: 'Ctrl+T',
  },
}

const defaultApiConfig: ApiConfig = {
  // Use relative URL so it works with HTTPS sites and avoids Mixed Content.
  // Configure your reverse proxy to forward /api/v1 -> backend.
  endpoint: '/api/v1',
  timeout: 30000,
  maxFileSize: 20 * 1024 * 1024, // 20MB
  allowedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'],
  enableCompression: true,
  retryAttempts: 3,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      apiConfig: defaultApiConfig,
      isInitialized: false,
      
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }))
      },
      
      resetSettings: () => {
        set({ settings: defaultSettings })
      },
      
      updateApiConfig: (updates) => {
        set((state) => ({
          apiConfig: { ...state.apiConfig, ...updates },
        }))
      },
      
      resetApiConfig: () => {
        set({ apiConfig: defaultApiConfig })
      },
      
      initialize: () => {
        if (get().isInitialized) return
        
        // 检测系统主题
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleThemeChange = (e: MediaQueryListEvent) => {
          const { settings } = get()
          if (settings.theme === 'system') {
            document.documentElement.classList.toggle('dark', e.matches)
          }
        }
        
        mediaQuery.addEventListener('change', handleThemeChange)
        
        // 应用初始主题
        const { settings } = get()
        if (settings.theme === 'dark' || (settings.theme === 'system' && mediaQuery.matches)) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        
        // 应用字体大小
        const fontSizeMap = {
          small: 'text-sm',
          medium: 'text-base',
          large: 'text-lg',
        }
        document.documentElement.classList.add(fontSizeMap[settings.fontSize])
        
        set({ isInitialized: true })
      },
    }),
    {
      name: 'photomagic-settings-store',
      partialize: (state) => ({
        settings: state.settings,
        apiConfig: state.apiConfig,
      }),
    }
  )
)

// 主题切换工具函数
export const applyTheme = (theme: UserSettings['theme']) => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (theme === 'light') {
    document.documentElement.classList.remove('dark')
  } else {
    // system
    if (mediaQuery.matches) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}