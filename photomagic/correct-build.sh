#!/bin/bash

# PhotoMagic Studio - 正确的 Cloudflare Pages 构建脚本
# 这个脚本假设在项目根目录执行

set -e  # 遇到错误时退出

echo "=========================================="
echo "🚀 PhotoMagic Studio - Cloudflare Pages 构建"
echo "=========================================="

# 设置环境变量
export NODE_VERSION=18
export NODE_ENV=production

echo ""
echo "📊 系统信息:"
echo "   系统时间: $(date)"
echo "   当前目录: $(pwd)"
echo "   Node版本: $(node --version)"
echo "   NPM版本: $(npm --version)"

echo ""
echo "📁 项目结构检查..."
if [ -d "frontend" ]; then
    echo "✅ 检测到 frontend 目录"
    FRONTEND_DIR="frontend"
elif [ -d "photomagic/frontend" ]; then
    echo "✅ 检测到 photomagic/frontend 目录"
    FRONTEND_DIR="photomagic/frontend"
else
    echo "❌ 错误: 找不到 frontend 目录"
    echo "当前目录内容:"
    ls -la
    exit 1
fi

if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    echo "❌ 错误: 找不到 $FRONTEND_DIR/package.json"
    exit 1
fi

echo "✅ 项目结构检查通过"

echo ""
echo "🔧 进入前端目录..."
cd "$FRONTEND_DIR"
echo "   构建目录: $(pwd)"

echo ""
echo "📦 安装依赖..."
echo "   开始时间: $(date +%H:%M:%S)"
npm install --no-audit --no-fund --loglevel=error
echo "   完成时间: $(date +%H:%M:%S)"

echo ""
echo "🔨 构建项目..."
echo "   开始时间: $(date +%H:%M:%S)"
npm run build
echo "   完成时间: $(date +%H:%M:%S)"

echo ""
echo "✅ 构建完成!"
echo "📊 构建结果统计:"

if [ -d "dist" ]; then
    # 统计文件数量
    FILE_COUNT=$(find dist -type f | wc -l)
    echo "   文件数量: $FILE_COUNT"
    
    # 计算总大小
    TOTAL_SIZE=$(du -sh dist | cut -f1)
    echo "   总大小: $TOTAL_SIZE"
    
    # 列出主要文件
    echo "   主要文件:"
    find dist -name "*.html" -o -name "*.js" -o -name "*.css" | head -10 | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo "     - $file ($size)"
    done
else
    echo "❌ 错误: dist 目录不存在"
    echo "当前目录内容:"
    ls -la
    exit 1
fi

echo ""
echo "📁 输出目录结构:"
echo "   $FRONTEND_DIR/dist/"
echo ""
echo "🎉 构建成功完成!"
echo "=========================================="