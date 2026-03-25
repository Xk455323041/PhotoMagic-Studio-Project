#!/bin/bash

# PhotoMagic Studio - 最简化构建脚本
# 专为 Cloudflare Pages 设计

echo "🚀 开始构建 PhotoMagic Studio..."

# 进入前端目录
cd frontend

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

echo "✅ 构建完成!"
echo "输出目录: frontend/dist"