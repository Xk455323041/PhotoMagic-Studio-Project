#!/bin/bash
set -e  # 遇到错误时退出

echo "=== Cloudflare Pages 构建脚本 ==="
echo "当前目录: $(pwd)"
echo "Node版本: $(node --version)"
echo "npm版本: $(npm --version)"

# 设置环境
export NODE_VERSION=18
export NODE_ENV=production

# 检查目录结构
echo "=== 检查目录结构 ==="
ls -la
echo ""
ls -la photomagic/
echo ""
ls -la photomagic/frontend/

# 进入前端目录
echo "=== 进入前端目录 ==="
cd photomagic/frontend

# 清理可能的缓存
echo "=== 清理缓存 ==="
rm -rf node_modules package-lock.json

# 安装依赖（使用更稳定的参数）
echo "=== 安装依赖 ==="
npm config set registry https://registry.npmjs.org/
npm config set fetch-retry-maxtimeout 60000
npm config set fetch-retry-mintimeout 10000

npm install --no-audit --no-fund --loglevel=error --progress=false

# 验证安装
echo "=== 验证安装 ==="
if [ -d "node_modules" ]; then
    echo "✅ 依赖安装成功"
    echo "安装的包数量: $(ls node_modules | wc -l)"
else
    echo "❌ 依赖安装失败"
    exit 1
fi

# 构建项目
echo "=== 构建项目 ==="
npm run build

# 检查构建结果
echo "=== 检查构建结果 ==="
if [ -d "dist" ]; then
    echo "✅ 构建成功"
    echo "构建文件数量: $(find dist -type f | wc -l)"
    echo "主要文件:"
    ls -la dist/
else
    echo "❌ 构建失败，dist目录不存在"
    exit 1
fi

echo "=== 构建完成 ==="