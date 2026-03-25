#!/bin/bash

# PhotoMagic Studio - 最终 Cloudflare Pages 构建脚本
# 专为 Cloudflare Pages 环境优化

set -e  # 遇到错误时退出

echo "=========================================="
echo "🚀 PhotoMagic Studio - Cloudflare Pages 构建"
echo "=========================================="

# 设置环境变量
export NODE_VERSION=18
export NODE_ENV=production

echo ""
echo "📊 环境信息:"
echo "   当前目录: $(pwd)"
echo "   Node版本: $(node --version 2>/dev/null || echo '未安装')"
echo "   NPM版本: $(npm --version 2>/dev/null || echo '未安装')"

echo ""
echo "📁 检查项目结构..."

# 检查 frontend 目录
if [ ! -d "frontend" ]; then
    echo "❌ 错误: 找不到 frontend 目录"
    echo "当前目录内容:"
    ls -la
    exit 1
fi

# 检查 package.json
if [ ! -f "frontend/package.json" ]; then
    echo "❌ 错误: 找不到 frontend/package.json"
    exit 1
fi

echo "✅ 项目结构检查通过"

echo ""
echo "🔧 进入前端目录..."
cd frontend
echo "   构建目录: $(pwd)"

echo ""
echo "📦 安装依赖..."
echo "   开始时间: $(date +%H:%M:%S)"

# 使用更安全的安装方式，忽略 post-install 脚本
npm install --no-audit --no-fund --loglevel=error --ignore-scripts

echo "   完成时间: $(date +%H:%M:%S)"
echo "✅ 依赖安装完成"

echo ""
echo "🔨 构建项目..."
echo "   开始时间: $(date +%H:%M:%S)"

# 执行构建
if npm run build; then
    echo "   完成时间: $(date +%H:%M:%S)"
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi

echo ""
echo "📊 构建结果验证..."

if [ -d "dist" ]; then
    # 检查必要的文件
    REQUIRED_FILES=("index.html" "assets/" "vite-manifest.json")
    MISSING_FILES=0
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -e "dist/$file" ]; then
            echo "   ✅ $file 存在"
        else
            echo "   ⚠️  $file 不存在"
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
echo "📁 输出目录: frontend/dist/"
echo "📁 最终输出路径: $(cd .. && pwd)/frontend/dist/"

echo ""
echo "🎉 构建成功完成!"
echo "=========================================="
echo ""
echo "💡 下一步:"
echo "   1. Cloudflare Pages 会将 frontend/dist/ 部署到生产环境"
echo "   2. 访问 https://photomagic-studio.pages.dev 查看部署结果"
echo "   3. 查看构建日志确认无错误"