#!/bin/bash

# 通用构建脚本 - 自动检测项目结构
# Cloudflare Pages 使用

set -e

echo "🔧 开始构建 PhotoMagic Studio..."

# 设置环境变量
export NODE_VERSION=18
export NODE_ENV=production

# 检测项目结构
echo "📁 检测项目结构..."

# 情况1：已经在 photomagic/frontend 目录
if [ -f "package.json" ] && [ -f "vite.config.ts" ]; then
    echo "✅ 检测到前端项目根目录"
    BUILD_DIR="."
    OUTPUT_DIR="dist"

# 情况2：在 photomagic 目录
elif [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo "✅ 检测到 photomagic 目录，前端项目在 frontend/"
    BUILD_DIR="frontend"
    OUTPUT_DIR="frontend/dist"
    cd "$BUILD_DIR"

# 情况3：在项目根目录，需要进入 photomagic/frontend
elif [ -d "photomagic/frontend" ] && [ -f "photomagic/frontend/package.json" ]; then
    echo "✅ 检测到项目根目录，前端项目在 photomagic/frontend/"
    BUILD_DIR="photomagic/frontend"
    OUTPUT_DIR="photomagic/frontend/dist"
    cd "$BUILD_DIR"

else
    echo "❌ 无法找到前端项目"
    echo "当前目录: $(pwd)"
    echo "目录内容:"
    ls -la
    exit 1
fi

echo "📁 构建目录: $(pwd)"

# 安装依赖
echo "📦 安装依赖..."
npm install --no-audit --no-fund --loglevel=error --ignore-scripts

# 构建项目
echo "🔨 构建项目..."
npm run build

# 验证构建结果
echo "✅ 构建完成!"
echo "📁 输出目录: $OUTPUT_DIR"

if [ -d "dist" ]; then
    echo "📊 构建文件统计:"
    find dist -type f | wc -l | xargs echo "  文件数量:"
    du -sh dist | awk '{print "  总大小: "$1}'
else
    echo "❌ dist 目录不存在"
    exit 1
fi

echo "🎉 构建成功!"