#!/bin/bash

# 修复 TypeScript 编译器缺失问题的构建脚本

set -e

echo "🔧 修复 TypeScript 编译器问题..."

# 进入前端目录
cd frontend

echo "📁 当前目录: $(pwd)"

echo ""
echo "📦 确保 TypeScript 已安装..."
# 检查 TypeScript 是否已安装
if ! npm list typescript 2>/dev/null | grep -q typescript; then
    echo "   ⚠️  TypeScript 未安装，正在安装..."
    npm install typescript --save-dev
else
    echo "   ✅ TypeScript 已安装"
fi

echo ""
echo "🔍 检查 TypeScript 编译器..."
# 检查 tsc 命令是否可用
if ! command -v tsc &> /dev/null; then
    echo "   ⚠️  tsc 命令不可用，尝试修复..."
    # 检查 node_modules/.bin 目录
    if [ -f "node_modules/.bin/tsc" ]; then
        echo "   ✅ 找到 node_modules/.bin/tsc"
        # 确保在 PATH 中
        export PATH="$PATH:$(pwd)/node_modules/.bin"
        echo "   🔧 已将 node_modules/.bin 添加到 PATH"
    else
        echo "   ❌ 无法找到 tsc，重新安装 TypeScript..."
        npm install typescript --save-dev --force
    fi
fi

echo ""
echo "🔨 开始构建..."
# 尝试构建
if command -v tsc &> /dev/null || [ -f "node_modules/.bin/tsc" ]; then
    echo "   ✅ TypeScript 编译器可用"
    # 使用修复后的构建命令
    npm run build
else
    echo "   ⚠️  TypeScript 编译器不可用，使用备用构建方法..."
    # 直接使用 vite build，跳过 tsc
    npx vite build
fi

echo ""
echo "✅ 构建完成!"