# PhotoMagic Studio Backend Service

智能图片处理平台后端 API 服务，提供四大核心功能：背景移除、证件照制作、背景替换、老照片修复。

## 🚀 功能特性

### 核心功能
- ✅ **背景移除** - 智能抠图，生成透明背景 PNG
- ✅ **证件照制作** - 标准尺寸、背景替换、美颜优化
- ✅ **背景替换** - 智能合成、自然融合、场景模板
- ✅ **老照片修复** - 破损修复、色彩还原、动态生成

### 技术特性
- 🔒 安全：Helmet 安全防护、CORS 配置、速率限制
- 📊 监控：结构化日志、请求追踪、错误处理
- ⚡ 性能：图片压缩、批量处理、异步任务
- 🛡️ 容错：优雅降级、错误捕获、参数验证
- 📁 存储：本地临时存储，自动过期清理

## 🛠️ 技术栈

- **框架**: Express + TypeScript
- **图片处理**: Sharp
- **AI 集成**: Remove.bg API（可扩展本地模型）
- **文件上传**: Multer
- **日志**: Winston
- **安全**: Helmet, CORS, Rate Limit
- **验证**: JWT（预留）
- **缓存**: Redis（预留）

## 📦 安装部署

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖
```bash
cd photomagic/backend
npm install
```

### 环境配置
复制 `.env.example` 到 `.env` 并配置：
```bash
cp .env.example .env
```

关键配置项：
```env
# 服务配置
PORT=3001
NODE_ENV=development

# CORS 配置
CORS_ORIGIN=http://localhost:3000

# Remove.bg API 配置（可选）
REMOVE_BG_API_KEY=your_api_key_here
```

### 启动开发服务器
```bash
npm run dev
```

### 生产构建
```bash
npm run build
npm start
```

## 📚 API 文档

### 基础信息
- **Base URL**: `http://localhost:3001/api/v1`
- **数据格式**: JSON
- **字符编码**: UTF-8

### 通用接口

#### 1. 健康检查
```http
GET /api/v1/health
```

**响应示例**:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-19T12:00:00Z",
  "version": "1.0.0",
  "services": {
    "background_removal": { "status": "healthy" },
    "id_photo": { "status": "healthy" },
    "background_replacement": { "status": "healthy" },
    "photo_restoration": { "status": "healthy" }
  }
}
```

#### 2. 文件上传
```http
POST /api/v1/upload
Content-Type: multipart/form-data
```

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | File | 是 | 图片文件 |
| `type` | String | 是 | 文件类型：`image` |
| `purpose` | String | 是 | 用途：`background_removal`, `id_photo`, `background_replacement`, `photo_restoration` |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "file_id": "file_123456789abcdef",
    "url": "/temp/file_123456789abcdef.jpg",
    "expires_at": "2026-03-20T12:00:00Z",
    "metadata": {
      "filename": "example.jpg",
      "size": 1024000,
      "mime_type": "image/jpeg",
      "dimensions": { "width": 1920, "height": 1080 }
    }
  }
}
```

### 功能接口

#### 1. 背景移除
```http
POST /api/v1/background-removal
Content-Type: application/json
```

**请求体**:
```json
{
  "file_id": "file_123456789abcdef",
  "parameters": {
    "size": "auto",
    "format": "png",
    "bg_color": "transparent",
    "edge_smoothness": "auto",
    "hair_detail": true,
    "shadow": false
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "result_id": "result_987654321fedcba",
    "url": "/temp/result_987654321fedcba.png",
    "expires_at": "2026-03-20T12:00:00Z",
    "processing_time": 2.34,
    "metadata": {
      "original_size": 1024000,
      "result_size": 512000,
      "format": "png",
      "dimensions": { "width": 1920, "height": 1080 }
    }
  }
}
```

#### 2. 证件照制作
```http
POST /api/v1/id-photo
Content-Type: application/json
```

**请求体**:
```json
{
  "file_id": "file_123456789abcdef",
  "parameters": {
    "photo_type": "id_card",
    "background": {
      "type": "solid",
      "color": "#ffffff"
    },
    "size": {
      "type": "大一寸",
      "dpi": 300
    },
    "output": {
      "format": "jpg",
      "quality": 90,
      "layout": "4x6"
    }
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "result_id": "result_987654321fedcba",
    "url": "/temp/result_987654321fedcba.jpg",
    "layout_url": "/temp/result_987654321fedcba_layout.jpg",
    "expires_at": "2026-03-20T12:00:00Z",
    "processing_time": 3.45,
    "metadata": {
      "size": "大一寸",
      "dimensions_mm": { "width": 33, "height": 48 },
      "dimensions_px": { "width": 390, "height": 567 },
      "layout": "4x6",
      "copies": 8
    }
  }
}
```

#### 3. 背景替换
```http
POST /api/v1/background-replacement
Content-Type: application/json
```

**请求体**:
```json
{
  "foreground_file_id": "file_123456789abcdef",
  "background_file_id": "file_123456790abcdef",
  "parameters": {
    "composition": {
      "position": { "x": 0.5, "y": 0.5 },
      "scale": 1.0,
      "edge_feathering": 50
    },
    "output": {
      "format": "jpg",
      "quality": 90
    }
  }
}
```

#### 4. 老照片修复
```http
POST /api/v1/photo-restoration
Content-Type: application/json
```

**请求体**:
```json
{
  "file_id": "file_123456789abcdef",
  "parameters": {
    "restoration_type": "full",
    "basic_repair": {
      "scratch_removal": true,
      "stain_removal": true
    },
    "colorization": {
      "enabled": true,
      "color_model": "realistic"
    },
    "super_resolution": {
      "enabled": true,
      "scale": 4
    },
    "output": {
      "create_comparison": true
    }
  }
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "result_id": "result_987654321fedcba",
    "url": "/temp/result_987654321fedcba.jpg",
    "comparison_url": "/temp/result_987654321fedcba_comparison.jpg",
    "expires_at": "2026-03-20T12:00:00Z",
    "processing_time": 12.34,
    "metadata": {
      "original_dimensions": { "width": 400, "height": 600 },
      "enhanced_dimensions": { "width": 1600, "height": 2400 },
      "colorized": true
    }
  }
}
```

## 🏗️ 项目结构

```
src/
├── app.ts                 # 应用入口
├── config/                # 配置文件
│   ├── env.ts            # 环境变量配置
│   └── logger.ts         # 日志配置
├── middleware/            # 中间件
│   ├── errorHandler.ts   # 全局错误处理
│   └── requestLogger.ts  # 请求日志
├── routes/                # 路由定义
│   ├── health.ts         # 健康检查
│   ├── upload.ts         # 文件上传
│   ├── background-removal.ts
│   ├── id-photo.ts
│   ├── background-replacement.ts
│   └── photo-restoration.ts
├── services/              # 业务逻辑
│   ├── fileService.ts    # 文件存储服务
│   ├── backgroundRemovalService.ts
│   ├── idPhotoService.ts
│   ├── backgroundReplacementService.ts
│   ├── photoRestorationService.ts
│   └── removeBgService.ts # Remove.bg API 封装
├── types/                 # TypeScript 类型定义
│   └── index.ts
└── utils/                 # 工具函数
    └── imageUtils.ts     # 图片处理工具
```

## 🧪 开发调试

### 日志级别
```env
LOG_LEVEL=debug  # 开发环境
LOG_LEVEL=info   # 生产环境
```

### 测试 API
使用 curl 测试接口：
```bash
# 健康检查
curl http://localhost:3001/api/v1/health

# 上传文件
curl -X POST -F "file=@test.jpg" -F "type=image" -F "purpose=background_removal" http://localhost:3001/api/v1/upload

# 背景移除
curl -X POST -H "Content-Type: application/json" -d '{"file_id":"file_123","parameters":{}}' http://localhost:3001/api/v1/background-removal
```

## 🔧 配置说明

### 文件存储
- 临时文件存储在 `./temp` 目录
- 文件自动 24 小时后过期清理
- 最大支持 20MB 文件上传

### 速率限制
- 默认限制：15 分钟内最多 100 个请求
- 可通过环境变量调整：`RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`

### CORS 配置
- 默认允许 `http://localhost:3000` 访问
- 生产环境请配置具体域名：`CORS_ORIGIN=https://yourdomain.com`

## 🚀 部署建议

### 生产环境配置
1. **使用反向代理**: Nginx 或 Cloudflare 做前端代理
2. **进程管理**: 使用 PM2 管理 Node.js 进程
3. **日志收集**: 配置 ELK 或云日志服务
4. **监控告警**: 配置服务健康检查和告警规则
5. **HTTPS**: 配置 SSL 证书，启用 HTTPS

### PM2 部署示例
```bash
npm install -g pm2
npm run build
pm2 start dist/app.js --name photomagic-backend
```

## 🤝 开发规范

- 使用 TypeScript 强类型检查
- 遵循 ESLint 代码规范
- 接口返回统一格式
- 错误信息明确友好
- 关键操作记录日志

## 📄 许可证

MIT License

## 🆘 问题反馈

如有问题或建议，请提交 Issue 或联系开发团队。
