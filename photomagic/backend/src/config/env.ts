import dotenv from 'dotenv'
import path from 'path'

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env') })

export interface EnvConfig {
  // 服务配置
  port: number
  host: string
  nodeEnv: 'development' | 'production' | 'test'

  // CORS配置
  corsOrigin: string

  // Remove.bg 配置
  removeBgApiKey: string
  removeBgEndpoint: string

  // VeLMagicX 配置
  velmagicxAccessKeyId: string
  velmagicxSecretAccessKey: string
  velmagicxServiceId: string
  velmagicxRegion: string
  velmagicxEndpoint: string

  // 文件存储配置
  storageType: 'local' | 's3'
  uploadDir: string
  tempDir: string
  maxFileSize: number
  allowedFileTypes: string[]

  // Redis 配置
  redisUrl: string

  // JWT 配置
  jwtSecret: string
  jwtExpiresIn: string

  // 速率限制
  rateLimitMax: number
  rateLimitWindowMs: number

  // 日志配置
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  logFile: string
}

// 环境变量验证和类型转换
const env: EnvConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: (process.env.NODE_ENV as EnvConfig['nodeEnv']) || 'development',

  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  removeBgApiKey: process.env.REMOVE_BG_API_KEY || '',
  removeBgEndpoint: process.env.REMOVE_BG_ENDPOINT || 'https://api.remove.bg/v1.0',

  velmagicxAccessKeyId: process.env.VELMAGICX_ACCESS_KEY_ID || '',
  velmagicxSecretAccessKey: process.env.VELMAGICX_SECRET_ACCESS_KEY || '',
  velmagicxServiceId: process.env.VELMAGICX_SERVICE_ID || '',
  velmagicxRegion: process.env.VELMAGICX_REGION || 'cn-north-1',
  velmagicxEndpoint: process.env.VELMAGICX_ENDPOINT || '',

  storageType: (process.env.STORAGE_TYPE as EnvConfig['storageType']) || 'local',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  tempDir: process.env.TEMP_DIR || './temp',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '20971520', 10), // 20MB
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff').split(','),

  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),

  logLevel: (process.env.LOG_LEVEL as EnvConfig['logLevel']) || 'info',
  logFile: process.env.LOG_FILE || './logs/app.log',
}

// 验证必填环境变量
const requiredEnvVars: Array<keyof EnvConfig> = [
  'jwtSecret',
]

const missingEnvVars = requiredEnvVars.filter((key) => !env[key])
if (missingEnvVars.length > 0) {
  throw new Error(`缺少必填环境变量: ${missingEnvVars.join(', ')}`)
}

export default env
