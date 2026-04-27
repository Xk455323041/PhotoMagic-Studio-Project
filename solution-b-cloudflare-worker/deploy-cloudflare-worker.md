# Cloudflare Worker 部署指南
## 方案B：配置Cloudflare Worker代理 /temp/* 请求

### 🎯 目标
创建Cloudflare Worker，将 `photomagic-studio-project.pages.dev/temp/*` 请求代理到后端服务器 `http://101.32.246.47:3002/temp/*`

### 📋 部署步骤

#### 步骤1：登录Cloudflare Dashboard
1. 访问 https://dash.cloudflare.com
2. 登录你的账户

#### 步骤2：创建Worker
1. 在左侧菜单选择 **Workers & Pages**
2. 点击 **Create application**
3. 选择 **Create Worker**
4. 给Worker命名，例如：`photomagic-temp-proxy`
5. 点击 **Deploy**

#### 步骤3：配置Worker代码
1. 在Worker编辑器中，删除默认代码
2. 复制以下代码并粘贴：

```javascript
// Cloudflare Worker for PhotoMagic /temp/* proxy
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Only handle /temp/* paths
    if (pathname.startsWith('/temp/')) {
      try {
        const filename = pathname.split('/temp/')[1];
        if (!filename) {
          return new Response('Missing filename', { status: 400 });
        }
        
        // Backend server URL
        const backendUrl = `http://101.32.246.47:3002/temp/${filename}`;
        
        // Prepare request headers
        const headers = new Headers(request.headers);
        headers.delete('cf-connecting-ip');
        headers.delete('cf-ray');
        headers.set('Host', '101.32.246.47:3002');
        headers.set('X-Forwarded-For', request.headers.get('cf-connecting-ip') || '');
        headers.set('X-Forwarded-Proto', 'https');
        
        // Forward request
        const backendRequest = new Request(backendUrl, {
          method: request.method,
          headers: headers,
          body: request.body,
          redirect: 'manual'
        });
        
        const response = await fetch(backendRequest);
        
        // Create response headers
        const responseHeaders = new Headers(response.headers);
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders
        });
        
      } catch (error) {
        return new Response(`Proxy error: ${error.message}`, { 
          status: 502,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }
    
    return new Response('Not Found', { 
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};
```

3. 点击 **Save and deploy**

#### 步骤4：配置Worker路由
1. 在Worker页面，点击 **触发器 (Triggers)**
2. 点击 **添加路由 (Add route)**
3. 输入路由规则：
   ```
   photomagic-studio-project.pages.dev/temp/*
   ```
4. 选择刚创建的Worker：`photomagic-temp-proxy`
5. 点击 **添加路由**

#### 步骤5：测试Worker
1. 访问测试URL：
   ```
   https://photomagic-temp-proxy.YOUR_SUBDOMAIN.workers.dev/temp/result_604ee756d15441e3b4a6adbfa8d81671.png
   ```
   （将 `YOUR_SUBDOMAIN` 替换为你的Worker子域名）

2. 测试Pages域名：
   ```
   https://photomagic-studio-project.pages.dev/temp/result_604ee756d15441e3b4a6adbfa8d81671.png
   ```

### 🔧 高级配置（可选）

#### 1. 环境变量配置
在Worker设置中添加环境变量：
- `BACKEND_URL`: `http://101.32.246.47:3002`

#### 2. 自定义域名
可以将Worker绑定到自定义域名：
- `temp-api.photomagic-studio.shop`

#### 3. 缓存配置
根据需求调整缓存策略。

### 🧪 测试脚本
```bash
# 测试后端直接访问
curl -I "http://101.32.246.47:3002/temp/result_604ee756d15441e3b4a6adbfa8d81671.png"

# 测试Worker访问
curl -I "https://photomagic-temp-proxy.YOUR_SUBDOMAIN.workers.dev/temp/result_604ee756d15441e3b4a6adbfa8d81671.png"

# 测试Pages域名访问
curl -I "https://photomagic-studio-project.pages.dev/temp/result_604ee756d15441e3b4a6adbfa8d81671.png"
```

### 📊 验证标准
1. ✅ 返回状态码 200
2. ✅ Content-Type: image/png
3. ✅ 文件大小: 173,875 字节
4. ✅ 可以正常下载和打开图片

### ⚠️ 注意事项
1. **Worker配额**：注意免费Worker的每日请求限制
2. **后端可用性**：确保后端服务器 `101.32.246.47:3002` 可访问
3. **CORS配置**：Worker已配置CORS，支持跨域访问
4. **缓存策略**：临时文件设置为不缓存

### 🚀 快速部署命令（使用Wrangler CLI）
如果你安装了Cloudflare Wrangler CLI：

```bash
# 安装Wrangler
npm install -g wrangler

# 登录
wrangler login

# 创建Worker项目
wrangler generate photomagic-temp-proxy

# 部署
wrangler deploy
```

### 📞 故障排除
1. **Worker返回502**：检查后端服务器是否运行
2. **CORS错误**：检查Worker的CORS头设置
3. **路由不匹配**：确认路由规则正确
4. **文件不存在**：检查后端临时文件是否存在

### ✅ 完成验证
部署完成后，以下URL应该都能正常访问：
- 直接后端：`http://101.32.246.47:3002/temp/result_604ee756d15441e3b4a6adbfa8d81671.png`
- Worker代理：`https://photomagic-studio-project.pages.dev/temp/result_604ee756d15441e3b4a6adbfa8d81671.png`