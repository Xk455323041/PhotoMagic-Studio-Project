import winston from 'winston'
import env from './env'

const { combine, timestamp, printf, colorize, align, errors } = winston.format

// 自定义日志格式
const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaString = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
  const stackString = stack ? `\n${stack}` : ''
  return `[${timestamp}] ${level}: ${message}${metaString}${stackString}`
})

const logger = winston.createLogger({
  level: env.logLevel,
  format: combine(
    errors({ stack: true }),
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