# 方案B: Cloudflare Worker 部署指南
## 解决 PhotoMagic 图片下载问题

---

## 📋 问题概述

**当前问题**:  
用户通过 `https://photomagic-studio-project.pages.dev/temp/result_604ee756d15441e3b4a6adbfa8d81671.png` 下载图片时，得到的是HTML文件（1,566字节）而不是PNG图片（173,875字节）。

**问题原因**:  
Cloudflare Pages 将所有请求重定向到前端单页应用（SPA）的 `index.html`，而不是代理到后端服务器。

**解决方案**:  
创建 Cloudflare Worker 代理 `/temp/*` 请求到后端服务器 `http://101.32.246.47:3002`。

---

## 🎯 方案B优势

| 优势 | 说明 |
|------|------|
| **无需修改代码** | 不需要修改前端或后端代码 |
| **快速部署** | 独立于前端应用，部署速度快 |
| **独立维护** | Worker可单独监控和管理 |
| **灵活配置** | 可随时调整代理规则 |
| **成本低廉** | Cloudflare Worker免费额度充足 |

---

## 🚀 部署步骤

### 方法A: Web界面部署（推荐）

#### 步骤1: 登录Cloudflare
1. 访问 https://dash.cloudflare.com
2. 使用你的账户登录

#### 步骤2: 创建Worker
1. 左侧菜单选择 **Workers & Pages**
2. 点击 **Create application**
3. 选择 **Create Worker**
4. 输入Worker名称: `photomagic-temp-proxy`
5. 点击 **Deploy**

#### 步骤3: 配置Worker代码
1. 在Worker编辑器中，删除所有默认代码
2. 复制以下完整代码并粘贴：

```javascript
// Cloudflare Worker: PhotoMagic /temp/* Proxy
// 代理 photomagic-studio-project.pages.dev/temp/* 到后端服务器

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname, search } = url;
    
    // 只处理 /temp/* 路径
    if (!pathname.startsWith('/temp/')) {
      return new Response('Not Found', { 
        status: 404,
        headers: { 
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-store'
        }
      });
    }
    
    try {
      // 提取文件名
      const filename = pathname.substring(6);
      if (!filename || filename.includes('..')) {
        return new Response('Invalid filename', { 
          status: 400,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // 后端服务器地址
      const BACKEND_HOST = '101.32.246.47:3002';
      const backendUrl = `http://${BACKEND_HOST}/temp/${filename}${search}`;
      
      // 准备请求头
      const headers = new Headers(request.headers);
      
      // 移除Cloudflare特定头部
      ['cf-connecting-ip', 'cf-ray', 'cf-visitor', 'cf-ipcountry'].forEach(h => headers.delete(h));
      
      // 设置代理头部
      headers.set('Host', BACKEND_HOST);
      headers.set('X-Forwarded-For', request.headers.get('cf-connecting-ip') || '');
      headers.set('X-Forwarded-Proto', 'https');
      headers.set('X-Real-IP', request.headers.get('cf-connecting-ip') || '');
      
      // 转发请求到后端（10秒超时）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      let response;
      try {
        response = await fetch(backendUrl, {
          method: request.method,
          headers: headers,
          body: request.body,
          redirect: 'manual',
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeoutId);
      }
      
      // 创建响应头
      const responseHeaders = new Headers(response.headers);
      
      // 添加CORS头部
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Range');
      
      // 缓存控制（临时文件不缓存）
      responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      responseHeaders.set('Pragma', 'no-cache');
      responseHeaders.set('Expires', '0');
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
      
    } catch (error) {
      // 错误处理
      let status = 502, message = 'Bad Gateway';
      if (error.name === 'AbortError') {
        status = 504; message = 'Gateway Timeout';
      }
      
      return new Response(`${message}: ${error.message}`, {
        status,
        headers: { 
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-store'
        }
      });
    }
  }
};
```

3. 点击 **Save and deploy**

#### 步骤4: 配置路由
1. 在Worker页面，点击 **Triggers**
2. 点击 **Add route**
3. 输入路由规则:
   ```
   photomagic-studio-project.pages.dev/temp/*
   ```
4. 选择Worker: `photomagic-temp-proxy`
5. 点击 **Add route**

#### 步骤5: 验证部署
1. 等待1-2分钟让配置生效
2. 测试URL: `https://photomagic-studio-project.pages.dev/temp/result_604ee756d15441e3b4a6adbfa8d81671.png`
3. 应该返回PNG图片而不是HTML

### 方法B: Wrangler CLI部署

#### 前置条件
```bash
# 安装Node.js和npm
# 安装Wrangler
npm install -g wrangler

# 登录
wrangler login
```

#### 部署命令
```bash
# 创建项目
wrangler generate photomagic-temp-proxy

# 进入目录
cd photomagic-temp-proxy

# 替换src/index.js内容为上面的Worker代码

# 部署
wrangler deploy

# 添加路由
wrangler route add photomagic-studio-project.pages.dev/temp/*
```

---

## 🧪 测试验证

### 测试命令
```bash
# 1. 测试后端直接访问
curl -I "http://101.32.246.47:3002/temp/result_604ee756d15441e3b4a6adbfa8d81671.png"

# 2. 测试Worker代理（部署后）
curl -I "https://photomagic-studio-project.pages.dev/temp/result_604ee756d15441e3b4a6adbfa8d81671.png"

# 3. 下载测试
curl -o test.png "https://photomagic-studio-project.pages.dev/temp/result_604ee756d15441e3b4a6adbfa8d81671.png"

# 4. 验证文件
ls -lh test.png
file test.png
```

### 预期结果
```
HTTP/2 200
content-type: image/png
content-length: 173875
cache-control: no-store, no-cache, must-revalidate, max-age=0
access-control-allow-origin: *
```

### 文件验证
```
-rw-r--r-- 1 user user 170K 文件时间 test.png
test.png: PNG image data, 295 x 413, 8-bit/color RGB, non-interlaced
```

---

## 📊 监控和维护

### 监控指标
1. **Worker日志**: Cloudflare Dashboard → Workers → photomagic-temp-proxy → Logs
2. **请求统计**: 查看请求量、错误率、响应时间
3. **配额使用**: 免费额度10万请求/天

### 维护任务
1. **定期检查**: 每月检查Worker运行状态
2. **后端监控**: 确保后端服务器正常运行
3. **日志分析**: 查看错误日志，及时处理问题
4. **性能优化**: 监控响应时间，优化配置

### 故障排除

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 502 Bad Gateway | 后端服务不可用 | 检查后端服务器状态 |
| 404 Not Found | 路由配置错误 | 检查Worker路由规则 |
| CORS错误 | 响应头缺失 | 检查CORS头部配置 |
| 超时错误 | 网络延迟 | 增加超时时间或优化网络 |
| 文件损坏 | 代理逻辑错误 | 检查Worker代码 |

---

## 🔧 高级配置（可选）

### 环境变量配置
在Worker设置中添加环境变量：
- `BACKEND_HOST`: `101.32.246.47:3002`
- `TIMEOUT_MS`: `10000`

### 自定义域名
可以将Worker绑定到自定义域名：
- `temp.photomagic-studio.shop`
- `cdn.photomagic-studio.shop`

### 缓存策略调整
根据需求调整缓存头：
```javascript
// 长期缓存（如静态资源）
responseHeaders.set('Cache-Control', 'public, max-age=31536000');

// 短期缓存（如用户生成内容）
responseHeaders.set('Cache-Control', 'public, max-age=3600');
```

### 安全增强
```javascript
// 添加安全头部
responseHeaders.set('X-Content-Type-Options', 'nosniff');
responseHeaders.set('X-Frame-Options', 'DENY');
responseHeaders.set('X-XSS-Protection', '1; mode=block');
responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
```

---

## 📈 性能优化

### 建议配置
1. **超时设置**: 10秒（当前配置）
2. **并发限制**: Cloudflare自动管理
3. **内存分配**: 默认128MB足够
4. **CPU时间**: 免费额度充足

### 性能监控
```bash
# 使用curl测试响应时间
time curl -o /dev/null -s -w "%{http_code} %{time_total}s\n" \
  "https://photomagic-studio-project.pages.dev/temp/test.png"
```

### 预期性能
- 平均响应时间: < 500ms
- 可用性: > 99.9%
- 错误率: < 0.1%

---

## 🎯 成功标准

部署完成后，以下标准应全部满足：

### 功能验证
- [ ] `https://photomagic-studio-project.pages.dev/temp/result_604ee756d15441e3b4a6adbfa8d81671.png` 返回PNG图片
- [ ] 文件大小: 173,875字节
- [ ] Content-Type: image/png
- [ ] 可以正常下载和打开
- [ ] 支持CORS跨域访问

### 性能验证
- [ ] 响应时间 < 1秒
- [ ] 可用性 > 99%
- [ ] 无502/504错误
- [ ] 缓存控制正确

### 运维验证
- [ ] Worker日志正常
- [ ] 错误监控有效
- [ ] 配额使用合理
- [ ] 配置备份完整

---

## 📞 支持信息

### 关键URL
- **后端服务器**: `http://101.32.246.47:3002`
- **测试图片**: `result_604ee756d15441e3b4a6adbfa8d81671.png`
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Worker管理**: Workers & Pages → photomagic-temp-proxy

### 联系支持
- **问题反馈**: 检查Worker日志
- **紧急问题**: 直接访问后端URL
- **配置问题**: 参考本指南

---

## ✅ 完成检查清单

- [ ] 已创建Cloudflare Worker
- [ ] 已配置Worker代码
- [ ] 已设置路由规则
- [ ] 已测试代理功能
- [ ] 已验证图片下载
- [ ] 已配置监控告警
- [ ] 已备份配置

---

**部署完成时间**: $(date)  
**部署人员**: 熊昆  
**方案版本**: B-1.0  
**最后验证**: 等待测试结果  

---

> **提示**: 部署完成后，请运行测试脚本验证功能。如有问题，参考故障排除章节。