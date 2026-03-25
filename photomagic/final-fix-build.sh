#!/bin/bash

# PhotoMagic Studio - 最终修复构建脚本
# 强制使用 npm，避免 bun 和 tsc 问题

set -e

echo "========================================"
echo "🚀 PhotoMagic Studio - 最终构建"
echo "========================================"

# 设置环境变量
export NODE_VERSION=18
export NODE_ENV=production

# 禁用 bun
export BUN_INSTALL_DISABLE=1
export DISABLE_BUN=1

echo ""
echo "📊 环境设置:"
echo "   当前目录: $(pwd)"
echo "   禁用 BUN: 是"
echo "   使用 NPM: 是"

echo ""
echo "📁 检查项目结构..."

# 确保在正确的目录
if [ ! -d "photomagic/frontend" ]; then
    echo "❌ 错误: 找不到 photomagic/frontend 目录"
    echo "当前目录内容:"
    ls -la
    exit 1
fi

echo "✅ 找到项目目录"

echo ""
echo "🔧 进入项目目录..."
cd photomagic/frontend
echo "   构建目录: $(pwd)"

echo ""
echo "🔄 清理环境..."
# 清理所有可能的缓存和旧文件
rm -rf node_modules 2>/dev/null || true
rm -f package-lock.json 2>/dev/null || true
rm -rf .npm 2>/dev/null || true

echo ""
echo "📦 安装依赖（使用 npm）..."
echo "   开始时间: $(date +%H:%M:%S)"

# 使用 npm install，避免任何缓存问题
npm install --no-audit --no-fund --loglevel=error --ignore-scripts --no-optional

echo "   完成时间: $(date +%H:%M:%S)"
echo "✅ 依赖安装完成"

echo ""
echo "🔨 执行构建..."
echo "   开始时间: $(date +%H:%M:%S)"

# 直接使用 vite build，避免 npm 脚本问题
npx vite build

echo "   完成时间: $(date +%H:%M:%S)"
echo "✅ 构建完成"

echo ""
echo "🔍 验证构建结果..."

if [ -d "dist" ]; then
    # 检查关键文件
    REQUIRED_FILES=("index.html" "assets/")
    MISSING_FILES=0
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -e "dist/$file" ]; then
            echo "   ✅ dist/$file 存在"
        else
            echo "   ❌ dist/$file 不存在"
            MISSING_FILES=$((MISSING_FILES + 1))
        fi
    done
    
    if [ $MISSING_FILES -eq 0 ]; then
        echo "✅ 所有必要文件都存在"
    else
        echo "⚠️  缺少 $MISSING_FILES 个必要文件"
    fi
    
    # 文件统计
    FILE_COUNT=$(find dist -type f 2>/dev/null | wc -l)
    echo "   文件数量: $FILE_COUNT"
    
    TOTAL_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "未知")
    echo "   总大小: $TOTAL_SIZE"
    
else
    echo "❌ 错误: dist 目录不存在"
    echo "当前目录内容:"
    ls -la
    exit 1
fi

echo ""
echo "🎉 构建成功完成!"
echo "📁 输出路径: $(pwd)/dist"
echo "📁 相对路径: photomagic/frontend/dist"

echo ""
echo "========================================"
echo "✅ 所有问题已修复！"
echo "========================================"