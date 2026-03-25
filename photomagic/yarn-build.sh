#!/bin/bash

# 使用 yarn 的构建脚本 - 避免 npm 错误

set -e

echo "🚀 PhotoMagic Studio - Yarn 构建脚本"
echo "======================================"

# 设置环境
export NODE_VERSION=18
export NODE_ENV=production

echo ""
echo "📁 进入前端目录..."
cd frontend
echo "   构建目录: $(pwd)"

echo ""
echo "🔧 检查 yarn 是否可用..."

# 检查 yarn 是否安装
if command -v yarn &> /dev/null; then
    echo "   ✅ yarn 可用"
    USE_YARN=true
else
    echo "   ⚠️  yarn 不可用，尝试安装..."
    # 尝试安装 yarn
    if npm install -g yarn 2>/dev/null; then
        echo "   ✅ yarn 安装成功"
        USE_YARN=true
    else
        echo "   ⚠️  yarn 安装失败，使用 npm"
        USE_YARN=false
    fi
fi

echo ""
echo "📦 安装依赖..."

if $USE_YARN; then
    echo "   使用 yarn 安装..."
    # 清理 yarn 缓存
    yarn cache clean 2>/dev/null || true
    # 安装依赖
    yarn install --frozen-lockfile --ignore-engines --ignore-optional --non-interactive
else
    echo "   使用 npm 安装（备用方案）..."
    # 使用最简化的 npm 安装
    npm install --no-audit --no-fund --loglevel=silent --ignore-scripts
fi

echo ""
echo "✅ 依赖安装完成"

echo ""
echo "🔨 执行构建..."

if $USE_YARN; then
    echo "   使用 yarn 构建..."
    yarn build
else
    echo "   使用 npm 构建..."
    npm run build
fi

echo ""
echo "✅ 构建完成!"
echo "📁 输出目录: dist/"

if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "🎉 构建验证通过!"
else
    echo "⚠️  构建验证失败"
    exit 1
fi

echo ""
echo "======================================"