#!/bin/bash

# 稳定的构建脚本 - 解决 npm 内部错误问题

set -e

echo "🚀 PhotoMagic Studio - 稳定构建脚本"
echo "======================================"

# 设置环境
export NODE_VERSION=18
export NODE_ENV=production

echo ""
echo "📊 环境信息:"
echo "   当前目录: $(pwd)"
echo "   Node版本: $(node --version 2>/dev/null || echo '未知')"
echo "   NPM版本: $(npm --version 2>/dev/null || echo '未知')"

echo ""
echo "📁 进入前端目录..."
cd frontend
echo "   构建目录: $(pwd)"

echo ""
echo "📦 清理 npm 缓存..."
# 清理可能的缓存问题
npm cache clean --force 2>/dev/null || true
rm -rf node_modules 2>/dev/null || true
rm -f package-lock.json 2>/dev/null || true

echo ""
echo "🔧 使用稳定的 npm 安装方法..."

# 方法1：使用 npm ci（更稳定）
if [ -f "package-lock.json" ]; then
    echo "   使用 npm ci（推荐用于 CI/CD）..."
    npm ci --no-audit --no-fund --loglevel=error
else
    echo "   使用 npm install（无 package-lock.json）..."
    # 使用最稳定的安装选项
    npm install --no-audit --no-fund --loglevel=error --ignore-scripts --no-optional
fi

echo ""
echo "✅ 依赖安装完成"

echo ""
echo "🔨 执行构建..."

# 检查构建命令
if grep -q '"build":' package.json; then
    echo "   执行 npm run build..."
    npm run build
else
    echo "   ⚠️  没有找到 build 脚本，尝试直接构建..."
    npx vite build
fi

echo ""
echo "✅ 构建完成!"
echo "📁 验证构建结果..."

if [ -d "dist" ]; then
    echo "   ✅ dist 目录存在"
    
    # 关键文件检查
    REQUIRED_FILES=("index.html")
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -e "dist/$file" ]; then
            echo "   ✅ dist/$file 存在"
        else
            echo "   ❌ dist/$file 不存在"
        fi
    done
    
    echo "   文件统计: $(find dist -type f 2>/dev/null | wc -l) 个文件"
    
else
    echo "   ❌ dist 目录不存在"
    echo "   当前目录内容:"
    ls -la
    exit 1
fi

echo ""
echo "🎉 构建成功完成!"
echo "======================================"