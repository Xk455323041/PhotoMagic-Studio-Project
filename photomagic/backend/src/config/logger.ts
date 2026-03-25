import winston from 'winston'
import env from './env'

const { combine, timestamp, printf, colorize, align } = winston.format

// 自定义日志格式
const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`
})

const logger = winston.createLogger({
  level: env.logLevel,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    align(),
    logFormat
  ),
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: combine(
        colorize(),
        logFormat
      ),
    }),
    
    // 文件输出
    new winston.transports.File({
      filename: env.logFile,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
  ],
})

// 开发环境额外配置
if (env.nodeEnv === 'development') {
  logger.level = 'debug'
}

// 生产环境配置
if (env.nodeEnv === 'production') {
  logger.level = 'info'
}

export default logger