# PhotoMagic Studio - Cloudflare Pages 配置指南

## 📋 项目信息
- **项目名称**: PhotoMagic Studio
- **前端技术栈**: React 18 + TypeScript + Vite + Tailwind CSS
- **构建输出目录**: `photomagic/frontend/dist`
- **包管理器**: npm

## 🎯 三个核心配置命令

### 1. Build Command（构建命令）
```bash
cd photomagic/frontend && npm install && npm run build
```

**作用**: 
- 进入前端目录
- 安装依赖
- 执行 TypeScript 编译和 Vite 构建

**输出目录**: `photomagic/frontend/dist`

### 2. Deploy Command（生产环境部署命令）
```bash
cd photomagic/frontend && npm install --no-audit --no-fund && npm run build
```

**触发条件**: 代码推送到 `main` 分支时自动执行

**环境变量**:
```bash
VITE_API_URL=https://api.photomagic-studio.com
VITE_ENV=production
VITE_APP_NAME=PhotoMagic Studio
VITE_MAX_FILE_SIZE=20971520  # 20MB
```

### 3. Non-production Branch Deploy Command（非生产分支部署命令）

#### 3.1 预览环境（所有分支）
```bash
cd photomagic/frontend && npm install --no-audit --no-fund && npm run build
```
- 环境: `VITE_ENV=preview`
- API: `https://preview-api.photomagic-studio.com`
- 域名: `<branch>-photomagic-studio.pages.dev`

#### 3.2 测试环境（staging 分支）
```bash
cd photomagic/frontend && npm install --no-audit --no-fund && npm run build:staging
```
- 环境: `VITE_ENV=staging`
- API: `https://staging-api.photomagic-studio.com`
- 域名: `staging-photomagic-studio.pages.dev`

#### 3.3 开发环境（develop 分支）
```bash
cd photomagic/frontend && npm install --no-audit --no-fund && npm run build:dev
```
- 环境: `VITE_ENV=development`
- API: `http://localhost:3000`
- 域名: `develop-photomagic-studio.pages.dev`

## 📁 配置文件选择

### 选项1：简化配置（推荐）
使用 `photomagic-simple-config.json` - 只包含核心命令
```bash
cp photomagic-simple-config.json cf-pages.json
```

### 选项2：完整配置
使用 `photomagic-cloudflare-optimized.json` - 包含所有高级功能
```bash
cp photomagic-cloudflare-optimized.json cf-pages.json
```

### 选项3：保持现有配置
现有的 `cf-pages.json` 已经可以工作，但建议更新为优化版本

## 🔧 环境变量配置

### 生产环境 (.env.production)
```env
VITE_API_URL=https://api.photomagic-studio.com
VITE_ENV=production
VITE_APP_NAME=PhotoMagic Studio
VITE_MAX_FILE_SIZE=20971520
VITE_SUPPORTED_FORMATS=jpg,jpeg,png,gif,webp
VITE_IMAGE_QUALITY=85
VITE_ENABLE_PWA=true
```

### 测试环境 (.env.staging)
```env
VITE_API_URL=https://staging-api.photomagic-studio.com
VITE_ENV=staging
VITE_APP_NAME=PhotoMagic Studio (Staging)
VITE_MAX_FILE_SIZE=10485760
VITE_SUPPORTED_FORMATS=jpg,jpeg,png,gif
VITE_IMAGE_QUALITY=80
```

### 开发环境 (.env.development)
```env
VITE_API_URL=http://localhost:3000
VITE_ENV=development
VITE_APP_NAME=PhotoMagic Studio (Dev)
VITE_MAX_FILE_SIZE=5242880
VITE_SUPPORTED_FORMATS=jpg,jpeg,png
VITE_IMAGE_QUALITY=70
VITE_DEBUG=true
```

## 🚀 部署步骤

### 步骤1：选择配置文件
```bash
# 使用简化配置
cp photomagic-simple-config.json photomagic/cf-pages.json

# 或使用完整配置
cp photomagic-cloudflare-optimized.json photomagic/cf-pages.json
```

### 步骤2：提交配置文件
```bash
git add photomagic/cf-pages.json
git commit -m "添加 Cloudflare Pages 配置"
git push origin main
```

### 步骤3：在 Cloudflare Dashboard 配置
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Pages** 页面
3. 选择或创建 PhotoMagic Studio 项目
4. 配置构建设置：
   - **构建命令**: `cd photomagic/frontend && npm install && npm run build`
   - **输出目录**: `photomagic/frontend/dist`
   - **Node.js 版本**: 18
5. 保存并部署

### 步骤4：验证部署
1. 访问生产环境: `https://photomagic-studio.pages.dev`
2. 访问预览环境: `https://<branch>-photomagic-studio.pages.dev`
3. 查看构建日志确保无错误

## 📊 新增的 npm scripts

前端 `package.json` 已更新，新增以下脚本：

```json
{
  "build:preview": "tsc && vite build --mode preview",
  "build:staging": "tsc && vite build --mode staging",
  "build:dev": "tsc && vite build --mode development",
  "build:prod": "tsc && vite build --mode production",
  "clean": "rm -rf dist node_modules/.vite",
  "build:clean": "npm run clean && npm run build"
}
```

## 🔍 故障排除

### 常见问题1：构建失败
**症状**: Cloudflare Pages 构建失败
**解决方案**:
```bash
# 本地测试构建
cd photomagic/frontend
npm install
npm run build

# 检查输出目录
ls -la dist/
```

### 常见问题2：依赖安装慢
**症状**: npm install 超时
**解决方案**:
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 或使用 pnpm
npm install -g pnpm
pnpm install
```

### 常见问题3：环境变量不生效
**症状**: 前端应用无法读取环境变量
**解决方案**:
1. 确保环境变量以 `VITE_` 开头
2. 在 `.env` 文件中正确设置
3. 重启开发服务器

## 🎯 最佳实践

1. **分支策略**:
   - `main`: 生产环境
   - `staging`: 测试环境
   - `develop`: 开发环境
   - `feature/*`: 功能分支

2. **缓存优化**:
   - 静态资源设置长期缓存
   - API 响应设置适当缓存策略
   - 使用 Cloudflare CDN 缓存

3. **安全配置**:
   - 配置 CSP 头
   - 设置 X-Frame-Options
   - 启用 HTTPS 重定向

4. **监控告警**:
   - 设置构建失败告警
   - 监控应用性能
   - 配置错误追踪

## 📞 技术支持

如果遇到问题：
1. 查看 Cloudflare Pages 构建日志
2. 本地运行 `npm run build` 测试
3. 检查环境变量配置
4. 验证输出目录结构

## 🔗 相关文件
- `photomagic-simple-config.json` - 简化配置
- `photomagic-cloudflare-optimized.json` - 完整配置
- `photomagic/frontend/package.json` - 前端构建脚本
- `photomagic/build.sh` - 现有构建脚本