#!/bin/bash
# Cloudflare Pages 构建脚本
# 放置在项目根目录

echo "🚀 开始构建 PhotoMagic Studio..."

# 设置环境变量
export NODE_VERSION=18
export NODE_ENV=production

# 进入前端目录
cd photomagic/frontend

echo "📦 安装依赖..."
npm install --no-audit --no-fund

echo "🔨 构建项目..."
npm run build

echo "✅ 构建完成!"
echo "输出目录: photomagic/frontend/dist"