/**
 * 环境变量配置
 * 用于管理不同环境下的配置
 */

// 从环境变量读取配置
export const envConfig = {
  // 应用信息
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'PhotoMagic Studio',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    description: import.meta.env.VITE_APP_DESCRIPTION || '智能图片处理平台',
  },

  // API 配置
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
  },

  // 功能开关
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    sentry: import.meta.env.VITE_ENABLE_SENTRY === 'true',
    debug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
    pwa: import.meta.env.VITE_ENABLE_PWA === 'true',
    mockApi: import.meta.env.VITE_MOCK_API === 'true',
  },

  // 第三方服务
  services: {
    sentry: {
      dsn: import.meta.env.VITE_SENTRY_DSN || '',
    },
    googleAnalytics: {
      id: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
    },
    volcengine: {
      accessKey: import.meta.env.VITE_VOLCENGINE_ACCESS_KEY || '',
      secretKey: import.meta.env.VITE_VOLCENGINE_SECRET_KEY || '',
    },
    tencentCos: {
      secretId: import.meta.env.VITE_TENCENT_COS_SECRET_ID || '',
      secretKey: import.meta.env.VITE_TENCENT_COS_SECRET_KEY || '',
      region: import.meta.env.VITE_TENCENT_COS_REGION || '',
      bucket: import.meta.env.VITE_TENCENT_COS_BUCKET || '',
    },
  },

  // 环境信息
  environment: import.meta.env.MODE || 'development',
  isProduction: import.meta.env.PROD === true,
  isDevelopment: import.meta.env.DEV === true,
} as const

// 环境验证
export const validateEnvConfig = () => {
  const warnings: string[] = []
  const errors: string[] = []

  // 检查必需的环境变量
  if (!import.meta.env.VITE_API_BASE_URL && envConfig.isProduction) {
    warnings.push('VITE_API_BASE_URL 未设置，将使用默认值')
  }

  // 检查功能依赖
  if (envConfig.features.analytics && !envConfig.services.googleAnalytics.id) {
    warnings.push('启用了分析功能但未设置 Google Analytics ID')
  }

  if (envConfig.features.sentry && !envConfig.services.sentry.dsn) {
    warnings.push('启用了错误监控但未设置 Sentry DSN')
  }

  return { warnings, errors, isValid: errors.length === 0 }
}

// 获取环境特定的配置
export const getEnvironmentConfig = () => {
  const env = envConfig.environment
  
  switch (env) {
    case 'production':
      return {
        api: {
          baseUrl: envConfig.api.baseUrl,
          timeout: 30000,
        },
        features: {
          analytics: true,
          sentry: true,
          debug: false,
          pwa: true,
        },
        logging: {
          level: 'error',
        },
      }
    case 'staging':
      return {
        api: {
          baseUrl: envConfig.api.baseUrl,
          timeout: 30000,
        },
        features: {
          analytics: true,
          sentry: true,
          debug: true,
          pwa: true,
        },
        logging: {
          level: 'warn',
        },
      }
    case 'development':
    default:
      return {
        api: {
          baseUrl: 'http://localhost:3001',
          timeout: 60000,
        },
        features: {
          analytics: false,
          sentry: false,
          debug: true,
          pwa: false,
        },
        logging: {
          level: 'debug',
        },
      }
  }
}

// 环境变量工具函数
export const env = {
  // 获取环境变量
  get: (key: string, defaultValue: string = ''): string => {
    return import.meta.env[key] || defaultValue
  },

  // 获取布尔值环境变量
  getBool: (key: string, defaultValue: boolean = false): boolean => {
    const value = import.meta.env[key]
    if (value === undefined) return defaultValue
    return value === 'true' || value === '1'
  },

  // 获取数字环境变量
  getNumber: (key: string, defaultValue: number = 0): number => {
    const value = import.meta.env[key]
    if (value === undefined) return defaultValue
    const num = parseFloat(value)
    return isNaN(num) ? defaultValue : num
  },

  // 检查环境
  is: (envName: string): boolean => {
    return import.meta.env.MODE === envName
  },

  // 获取所有环境变量（安全过滤）
  getAll: (): Record<string, string> => {
    const allEnv: Record<string, string> = {}
    for (const key in import.meta.env) {
      // 过滤掉敏感信息
      if (!key.toLowerCase().includes('secret') && 
          !key.toLowerCase().includes('key') && 
          !key.toLowerCase().includes('password') &&
          !key.toLowerCase().includes('token')) {
        allEnv[key] = import.meta.env[key] as string
      }
    }
    return allEnv
  },
}

// 默认导出
export default envConfig