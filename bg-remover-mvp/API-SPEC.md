# API 接口规范文档

## 概述

本文档定义了图片背景移除网站的API接口规范，包括前端与Cloudflare Worker之间的通信协议，以及Worker与Remove.bg API的集成规范。

## 基础信息

### 服务端点
- **前端服务**：`https://quickbg-remover.pages.dev` (示例)
- **API服务**：`https://api.quickbg-remover.workers.dev`
- **Remove.bg API**：`https://api.remove.bg/v1.0/removebg`

### 通信协议
- **传输协议**：HTTPS
- **数据格式**：JSON (错误响应) / Binary (图片响应)
- **字符编码**：UTF-8

### 认证方式
- **前端到Worker**：无需认证（CORS限制）
- **Worker到Remove.bg**：API Key认证
- **API Key存储**：Cloudflare Workers环境变量

## 接口定义

### 1. 背景移除接口

#### 接口说明
处理单张图片的背景移除，支持多种图片格式。

#### 请求信息
- **请求方法**：`POST`
- **请求路径**：`/api/remove-background`
- **Content-Type**：`multipart/form-data`

#### 请求参数
| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `image` | File | 是 | 图片文件 | - |
| `size` | String | 否 | 输出尺寸，默认`auto` | `auto`, `preview`, `full` |
| `format` | String | 否 | 输出格式，默认`png` | `png`, `jpg`, `zip` |
| `bg_color` | String | 否 | 背景颜色，默认透明 | `transparent`, `white`, `#FF0000` |

#### 请求示例
```bash
curl -X POST \
  https://api.quickbg-remover.workers.dev/api/remove-background \
  -H 'Content-Type: multipart/form-data' \
  -F 'image=@/path/to/image.jpg' \
  -F 'size=auto' \
  -F 'format=png'
```

#### 响应信息
- **成功响应**：
  - **Content-Type**：`image/png` (或指定格式)
  - **Body**：二进制图片数据
  - **Headers**：
    ```http
    Content-Type: image/png
    Content-Length: 123456
    X-Processing-Time: 1234
    X-Request-ID: req_123456789
    ```

- **错误响应**：
  - **Content-Type**：`application/json`
  - **Status Code**：4xx/5xx
  - **Body**：
    ```json
    {
      "error": {
        "code": "API_ERROR",
        "message": "Remove.bg API returned an error",
        "details": "Invalid API key",
        "request_id": "req_123456789",
        "timestamp": "2026-03-19T00:00:00Z"
      }
    }
    ```

#### 响应状态码
| 状态码 | 说明 | 可能原因 |
|--------|------|----------|
| 200 | 成功 | 图片处理成功 |
| 400 | 请求错误 | 文件格式不支持、文件过大 |
| 401 | 认证失败 | API Key无效 |
| 429 | 请求过多 | 达到API限制 |
| 500 | 服务器错误 | Remove.bg API错误、内部错误 |
| 502 | 网关错误 | Remove.bg服务不可用 |
| 504 | 网关超时 | 处理超时 |

### 2. 健康检查接口

#### 接口说明
检查服务健康状态，包括Worker和Remove.bg API的连接状态。

#### 请求信息
- **请求方法**：`GET`
- **请求路径**：`/api/health`
- **Content-Type**：`application/json`

#### 请求示例
```bash
curl -X GET \
  https://api.quickbg-remover.workers.dev/api/health
```

#### 响应信息
```json
{
  "status": "healthy",
  "timestamp": "2026-03-19T00:00:00Z",
  "services": {
    "worker": {
      "status": "healthy",
      "version": "1.0.0",
      "uptime": 123456
    },
    "remove_bg": {
      "status": "healthy",
      "response_time": 123,
      "credits_remaining": 45
    }
  },
  "metrics": {
    "total_requests": 1234,
    "success_rate": 0.99,
    "avg_processing_time": 2345
  }
}
```

### 3. 使用统计接口

#### 接口说明
获取API使用统计信息（需要认证）。

#### 请求信息
- **请求方法**：`GET`
- **请求路径**：`/api/stats`
- **认证**：Bearer Token
- **Content-Type**：`application/json`

#### 请求示例
```bash
curl -X GET \
  https://api.quickbg-remover.workers.dev/api/stats \
  -H 'Authorization: Bearer admin_token'
```

#### 响应信息
```json
{
  "period": {
    "start": "2026-03-01T00:00:00Z",
    "end": "2026-03-19T00:00:00Z"
  },
  "usage": {
    "total_requests": 1234,
    "successful_requests": 1220,
    "failed_requests": 14,
    "unique_users": 456
  },
  "files": {
    "total_size_mb": 1234.56,
    "avg_file_size_kb": 234.5,
    "formats": {
      "jpg": 567,
      "png": 432,
      "webp": 235
    }
  },
  "performance": {
    "avg_response_time_ms": 1234,
    "p95_response_time_ms": 2345,
    "p99_response_time_ms": 3456
  }
}
```

## 错误处理

### 错误代码定义

| 错误代码 | HTTP状态码 | 说明 | 解决方案 |
|----------|------------|------|----------|
| `INVALID_FILE_FORMAT` | 400 | 不支持的文件格式 | 上传JPG、PNG或WebP格式 |
| `FILE_TOO_LARGE` | 400 | 文件超过10MB限制 | 压缩图片或使用更小的文件 |
| `INVALID_API_KEY` | 401 | API Key无效 | 检查环境变量配置 |
| `API_RATE_LIMITED` | 429 | API调用频率限制 | 稍后重试或升级API计划 |
| `API_SERVICE_ERROR` | 502 | Remove.bg服务错误 | 稍后重试 |
| `PROCESSING_TIMEOUT` | 504 | 处理超时 | 使用更小的图片或稍后重试 |
| `INTERNAL_ERROR` | 500 | 内部服务器错误 | 联系技术支持 |

### 错误响应格式
```json
{
  "error": {
    "code": "错误代码",
    "message": "用户友好的错误信息",
    "details": "技术细节（仅开发环境）",
    "request_id": "唯一的请求ID",
    "timestamp": "错误发生时间",
    "documentation_url": "https://docs.example.com/errors/错误代码"
  }
}
```

## 数据格式

### 图片格式支持

#### 输入格式
| 格式 | MIME类型 | 扩展名 | 说明 |
|------|----------|--------|------|
| JPEG | `image/jpeg` | `.jpg`, `.jpeg` | 支持基线、渐进式 |
| PNG | `image/png` | `.png` | 支持透明通道 |
| WebP | `image/webp` | `.webp` | 支持有损/无损 |

#### 输出格式
| 格式 | MIME类型 | 说明 |
|------|----------|------|
| PNG | `image/png` | 透明背景（默认） |
| JPG | `image/jpeg` | 白色背景 |
| ZIP | `application/zip` | 批量处理时使用 |

### 文件大小限制
- **最大输入大小**：10 MB
- **最大输出大小**：无限制（依赖Remove.bg）
- **推荐大小**：< 5 MB（最佳性能）

## 性能指标

### 响应时间要求
| 指标 | 目标值 | 说明 |
|------|--------|------|
| API响应时间(P95) | < 3秒 | 从请求到开始响应 |
| 图片处理时间(P95) | < 15秒 | 10MB图片处理时间 |
| 总处理时间(P95) | < 20秒 | 上传+处理+下载 |

### 吞吐量要求
| 指标 | 目标值 | 说明 |
|------|--------|------|
| 并发请求数 | 100 | 同时处理的请求 |
| 每日请求数 | 10,000 | 每日处理上限 |
| 错误率 | < 1% | 失败请求比例 |

## 安全规范

### 认证和授权

#### API Key管理
```javascript
// Cloudflare Worker环境变量
REMOVE_BG_API_KEY = "your-remove-bg-api-key"
ADMIN_TOKEN = "your-admin-token" // 用于管理接口
```

#### CORS配置
```javascript
// Worker中的CORS配置
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://quickbg-remover.pages.dev',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};
```

### 输入验证

#### 文件验证
```javascript
// 验证逻辑
function validateImage(file) {
  // 1. 文件类型验证
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('INVALID_FILE_FORMAT');
  }
  
  // 2. 文件大小验证 (10MB = 10 * 1024 * 1024)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('FILE_TOO_LARGE');
  }
  
  // 3. 文件名验证
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const extension = file.name.toLowerCase().slice(-5);
  if (!allowedExtensions.some(ext => extension.endsWith(ext))) {
    throw new Error('INVALID_FILE_FORMAT');
  }
}
```

#### 参数验证
```javascript
// 请求参数验证
function validateParams(params) {
  const { size, format, bg_color } = params;
  
  // size验证
  const allowedSizes = ['auto', 'preview', 'full'];
  if (size && !allowedSizes.includes(size)) {
    throw new Error('INVALID_PARAMETER');
  }
  
  // format验证
  const allowedFormats = ['png', 'jpg', 'zip'];
  if (format && !allowedFormats.includes(format)) {
    throw new Error('INVALID_PARAMETER');
  }
  
  // bg_color验证
  if (bg_color && !isValidColor(bg_color)) {
    throw new Error('INVALID_PARAMETER');
  }
}
```

### 限流策略

#### 基于IP的限流
```javascript
// 使用Cloudflare Rate Limiting
// wrangler.toml配置
[[limits]]
duration = 60
requests = 100
```

#### 基于用户的限流
```javascript
// 简单的内存缓存限流
const rateLimitStore = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowSize = 60 * 1000; // 1分钟
  const maxRequests = 10; // 每分钟10次
  
  const userRequests = rateLimitStore.get(ip) || [];
  const recentRequests = userRequests.filter(time => now - time < windowSize);
  
  if (recentRequests.length >= maxRequests) {
    throw new Error('RATE_LIMITED');
  }
  
  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);
}
```

## 监控和日志

### 日志格式
```json
{
  "timestamp": "2026-03-19T00:00:00Z",
  "level": "info",
  "request_id": "req_123456789",
  "method": "POST",
  "path": "/api/remove-background",
  "ip": "123.123.123.123",
  "user_agent": "Mozilla/5.0...",
  "file_size": 1234567,
  "file_type": "image/jpeg",
  "processing_time": 1234,
  "status": "success",
  "error": null
}
```

### 监控指标
| 指标名称 | 类型 | 说明 | 告警阈值 |
|----------|------|------|----------|
| `api_requests_total` | Counter | 总请求数 | - |
| `api_errors_total` | Counter | 错误请求数 | > 5% |
| `processing_time_ms` | Histogram | 处理时间 | P95 > 15s |
| `file_size_bytes` | Histogram | 文件大小分布 | - |
| `concurrent_requests` | Gauge | 并发请求数 | > 100 |

### 告警规则
```yaml
rules:
  - alert: HighErrorRate
    expr: rate(api_errors_total[5m]) / rate(api_requests_total[5m]) > 0.05
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "API错误率超过5%"
      
  - alert: SlowProcessing
    expr: histogram_quantile(0.95, rate(processing_time_ms_bucket[5m])) > 15000
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "95%的请求处理时间超过15秒"
```

## 部署配置

### Cloudflare Worker配置
```toml
# wrangler.toml
name = "quickbg-remover-api"
compatibility_date = "2024-12-01"
main = "src/index.ts"
workers_dev = true

[vars]
ENVIRONMENT = "production"
REMOVE_BG_API_KEY = "{{REMOVE_BG_API_KEY}}"
ADMIN_TOKEN = "{{ADMIN_TOKEN}}"

[[routes]]
pattern = "api.quickbg-remover.workers.dev/*"
zone_name = "quickbg-remover.com"

# 限流配置
[[limits]]
duration = 60
requests = 100

# 环境配置
[env.production]
name = "quickbg-remover-api-prod"

[env.staging]
name = "quickbg-remover-api-staging"
```

### 环境变量
```bash
# 生产环境
REMOVE_BG_API_KEY=your_production_api_key
ADMIN_TOKEN=your_admin_token
ENVIRONMENT=production
LOG_LEVEL=info

# 开发环境
REMOVE_BG_API_KEY=your_development_api_key
ADMIN_TOKEN=dev_admin_token
ENVIRONMENT=development
LOG_LEVEL=debug
```

## 测试用例

### 单元测试
```javascript
// 测试文件验证
test('validateImage - valid file', () => {
  const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
  expect(() => validateImage(file)).not.toThrow();
});

test('validateImage - invalid type', () => {
  const file = new File([''], 'test.gif', { type: 'image/gif' });
  expect(() => validateImage(file)).toThrow('INVALID_FILE_FORMAT');
});

test('validateImage - too large', () => {
  const content = new Array(11 * 1024 * 1024).fill('a');
  const file = new File(content, 'large.jpg', { type: 'image/jpeg' });
  expect(() => validateImage(file)).toThrow('FILE_TOO_LARGE');
});
```

### 集成测试
```javascript
// 测试完整API流程
test('POST /api/remove-background - success', async () => {
  const formData = new FormData();
  formData.append('image', testImage);
  
  const response = await fetch(`${API_URL}/api/remove-background`, {
    method: 'POST',
    body: formData,
  });
  
  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toBe('image/png');
});

test('POST /api/remove-background - invalid file', async () => {
  const formData = new FormData();
  formData.append('image', invalidFile);
  
  const response = await fetch(`${API_URL}/api/remove-background`, {
    method: 'POST',
    body: formData,
  });
  
  expect(response.status).toBe(400);
  const data = await response.json();
  expect(data.error.code).toBe('INVALID_FILE_FORMAT');
});
```

### 性能测试
```javascript
// 负载测试脚本
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // 逐步增加到50用户
    { duration: '1m', target: 50 },   // 保持50用户1分钟
    { duration: '30s', target: 100 }, // 增加到100用户
    { duration: '1m', target: 100 },  // 保持100用户1分钟
    { duration: '30s', target: 0 },   // 逐步减少
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95%请求<5秒
    http_req_failed: ['rate<0.01'],    // 错误率<1%
  },
};

export default function () {
  const formData = {
    image: http.file(open('./test-image.jpg'), 'test.jpg'),
  };
  
  const response = http.post(`${__ENV.API_URL}/api/remove-background`, formData);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'content-type is image/png': (r) => r.headers['Content-Type'] === 'image/png',
  });
  
  sleep(1);
}
```

## 附录

### A. Remove.bg API 集成

#### 请求格式
```javascript
const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
  method: 'POST',
  headers: {
    'X-Api-Key': env.REMOVE_BG_API_KEY,
  },
  body: formData,
});
```

#### 响应处理
```javascript
if (removeBgResponse.ok) {
  // 成功 - 返回图片
  const imageBuffer = await removeBgResponse.arrayBuffer();
  return new Response(imageBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'X-Processing-Time': processingTime,
    },
  });
} else {
  // 失败 - 解析错误
  const errorText = await removeBgResponse.text();
  throw new Error(`Remove.bg API error: ${removeBgResponse.status} - ${errorText}`);
}
```

### B. 常用工具函数

#### Base64转换
```javascript
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function base64ToBlob(base64) {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
}
```

#### 图片压缩
```javascript
async function compressImage(file, maxWidth = 1920, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // 按比例缩放
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = reject;
  });
}
```

---
*文档版本：v1.0*
*最后更新：2026-03-19*
*文档状态：评审中*