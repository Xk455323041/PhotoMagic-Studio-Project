#!/bin/bash

# 最小化构建脚本 - 避免所有可能的错误

set -e

echo "🚀 开始构建 PhotoMagic Studio..."

# 进入前端目录
cd frontend

echo ""
echo "📦 安装依赖（最小化）..."

# 只安装必要的依赖，跳过所有可能出错的步骤
npm install --only=prod --no-audit --no-fund --no-optional --ignore-scripts --loglevel=error

echo ""
echo "🔨 执行构建..."

# 直接调用 vite build，避免 npm 脚本问题
npx vite build

echo ""
echo "✅ 构建完成!"

# 简单验证
if [ -f "dist/index.html" ]; then
    echo "🎉 构建成功!"
    echo "📁 输出: dist/index.html"
else
    echo "⚠️  构建可能有问题"
    exit 1
fi