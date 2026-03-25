# Cloudflare Pages 配置指南

## 1. Build Command（构建命令）

构建命令用于在部署前编译你的项目。根据项目类型，常见的构建命令包括：

### 通用构建命令：
```bash
# 使用 npm
npm run build

# 使用 yarn
yarn build

# 使用 pnpm
pnpm run build
```

### 项目特定构建命令：
- **React/Vite**: `npm run build`
- **Next.js**: `npm run build`
- **Vue.js**: `npm run build`
- **Angular**: `ng build --prod`
- **Svelte**: `npm run build`
- **静态网站**: 可能不需要构建命令，或使用特定的生成器命令

## 2. Deploy Command（部署命令）

部署命令用于将构建后的文件部署到 Cloudflare Pages。通常与构建命令相同。

### 生产环境部署：
```bash
# 主分支（main/master）自动部署到生产环境
npm run build
```

### 环境变量配置：
```json
{
  "environment_variables": {
    "NODE_VERSION": "18",
    "API_URL": "https://api.yourdomain.com",
    "ENV": "production"
  }
}
```

## 3. Non-production Branch Deploy Command（非生产分支部署命令）

非生产分支用于预览、测试和开发环境。

### 配置示例：
```json
{
  "deploy": {
    "production": {
      "branch": "main",
      "command": "npm run build"
    },
    "preview": {
      "branch": "*",  // 所有分支
      "command": "npm run build"
    },
    "staging": {
      "branch": "staging",
      "command": "npm run build:staging"
    },
    "development": {
      "branch": "develop",
      "command": "npm run build:dev"
    }
  }
}
```

### 不同环境的构建命令：
1. **预览环境（所有分支）**：
   ```bash
   npm run build
   ```

2. **测试环境（staging分支）**：
   ```bash
   npm run build:staging
   # 或使用环境变量
   npm run build -- --mode staging
   ```

3. **开发环境（develop分支）**：
   ```bash
   npm run build:dev
   # 或使用环境变量
   npm run build -- --mode development
   ```

## 4. 完整的配置文件示例

### 方法一：在 Cloudflare Dashboard 中配置
1. 登录 Cloudflare Dashboard
2. 进入 Pages 页面
3. 选择你的项目
4. 进入 "Settings" > "Build & deployments"
5. 配置构建设置

### 方法二：使用 `wrangler.toml` 文件
```toml
[pages]
name = "your-project-name"
production_branch = "main"
compatibility_date = "2024-01-01"

[[pages.env.production.build]]
command = "npm run build"
output_dir = "dist"

[[pages.env.preview.build]]
command = "npm run build"
output_dir = "dist"
```

### 方法三：使用 `_headers` 和 `_redirects` 文件
- `_headers`：配置 HTTP 头
- `_redirects`：配置重定向规则

## 5. 最佳实践

1. **缓存配置**：
   ```bash
   # 在构建命令中清除缓存
   npm run clean && npm run build
   ```

2. **环境特定配置**：
   ```bash
   # package.json scripts
   {
     "scripts": {
       "build": "vite build",
       "build:staging": "vite build --mode staging",
       "build:dev": "vite build --mode development"
     }
   }
   ```

3. **输出目录**：
   - React/Vite: `dist`
   - Next.js: `.next`
   - Vue.js: `dist`
   - Angular: `dist/your-project-name`

4. **Node.js 版本**：
   ```json
   {
     "environment_variables": {
       "NODE_VERSION": "18"
     }
   }
   ```

## 6. 故障排除

### 常见问题：
1. **构建失败**：
   - 检查 Node.js 版本
   - 检查依赖是否正确安装
   - 查看构建日志中的错误信息

2. **部署失败**：
   - 检查输出目录配置
   - 确认构建命令正确
   - 检查环境变量配置

3. **预览环境问题**：
   - 确认分支名称匹配
   - 检查环境变量是否针对不同环境正确设置

### 调试建议：
1. 在本地运行构建命令测试
2. 检查 Cloudflare Pages 的构建日志
3. 使用 `wrangler pages dev` 进行本地测试
4. 查看部署状态和错误信息