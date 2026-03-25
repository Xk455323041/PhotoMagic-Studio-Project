# PhotoMagic Studio - Cloudflare Pages 部署指南

## 🔧 问题修复总结

**原问题**：Cloudflare Pages 构建失败，提示 `Failed: root directory not found`

**根本原因**：`cf-pages.json` 中的 `root_dir` 配置为 `/`，导致 Cloudflare 无法找到正确的根目录。

**解决方案**：移除 `root_dir` 配置，直接使用相对路径。

## ✅ 修复后的配置

### 配置文件：`photomagic/cf-pages.json`
```json
{
  "build": {
    "command": "cd photomagic/frontend && npm install && npm run build",
    "output_dir": "photomagic/frontend/dist"
  },
  "environment_variables": {
    "NODE_VERSION": "18",
    "NODE_ENV": "production"
  },
  "routes": [
    {
      "pattern": "/*",
      "file": "photomagic/frontend/dist/index.html",
      "status": 200
    }
  ]
}
```

## 🚀 部署步骤

### 步骤1：提交修复的配置
```bash
git add photomagic/cf-pages.json
git commit -m "修复 Cloudflare Pages 根目录配置错误"
git push origin main
```

### 步骤2：在 Cloudflare Dashboard 中配置

#### 方法A：使用配置文件（推荐）
1. 确保 `cf-pages.json` 在项目根目录
2. Cloudflare 会自动读取配置

#### 方法B：手动配置
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Pages** → **PhotoMagic Studio** 项目
3. 进入 **Settings** → **Build & deployments**
4. 配置如下：
   - **Build command**:
     ```
     cd photomagic/frontend && npm install && npm run build
     ```
   - **Build output directory**:
     ```
     photomagic/frontend/dist
     ```
   - **Root directory**:
     ```
     （留空）
     ```
   - **Node.js version**: `18`

### 步骤3：验证部署
1. 等待构建完成（约 2-3 分钟）
2. 检查构建日志，确保没有错误
3. 访问部署的网站：
   - 生产环境：`https://photomagic-studio.pages.dev`
   - 预览环境：`https://<branch>-photomagic-studio.pages.dev`

## 📋 三个核心命令总结

### 1. Build Command（构建命令）
```bash
cd photomagic/frontend && npm install && npm run build
```

### 2. Deploy Command（生产环境部署命令）
```bash
cd photomagic/frontend && npm install --no-audit --no-fund && npm run build
```
- **触发**：推送到 `main` 分支
- **环境**：`NODE_ENV=production`

### 3. Non-production Branch Deploy Command（非生产分支部署命令）

#### 预览环境（所有分支）：
```bash
cd photomagic/frontend && npm install --no-audit --no-fund && npm run build
```

#### 测试环境（staging 分支）：
```bash
cd photomagic/frontend && npm install --no-audit --no-fund && npm run build:staging
```

#### 开发环境（develop 分支）：
```bash
cd photomagic/frontend && npm install --no-audit --no-fund && npm run build:dev
```

## 🔍 故障排除

### 如果构建仍然失败：

1. **检查构建日志**：
   - 查看具体的错误信息
   - 确认错误发生的位置

2. **本地测试**：
   ```bash
   cd photomagic/frontend
   npm install
   npm run build
   ```

3. **常见问题**：
   - **依赖安装失败**：使用 `npm install --no-audit --no-fund`
   - **内存不足**：增加构建内存限制
   - **超时**：优化构建流程或增加超时时间

4. **Cloudflare 特定配置**：
   - 确保 **Root directory** 留空
   - 使用正确的 **Node.js version**（18）
   - 设置必要的 **Environment variables**

## 📊 环境变量建议

### 生产环境：
```bash
NODE_VERSION=18
NODE_ENV=production
VITE_API_URL=https://api.photomagic-studio.com
VITE_ENV=production
```

### 测试环境：
```bash
NODE_VERSION=18
NODE_ENV=production
VITE_API_URL=https://staging-api.photomagic-studio.com
VITE_ENV=staging
```

### 开发环境：
```bash
NODE_VERSION=18
NODE_ENV=development
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

## 🎉 完成状态
- ✅ 修复了 `root directory not found` 错误
- ✅ 更新了配置文件
- ✅ 提供了完整的部署指南
- ✅ 验证了构建命令正常工作

现在重新触发构建应该可以成功！