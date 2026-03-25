#!/bin/bash

# PhotoMagic Studio - 终极 Cloudflare Pages 构建脚本
# 专为解决所有构建问题设计

echo "========================================"
echo "🚀 PhotoMagic Studio - Cloudflare 构建"
echo "========================================"

# 设置环境
export NODE_VERSION=18
export NODE_ENV=production

echo ""
echo "📊 环境检查:"
echo "   目录: $(pwd)"
echo "   Node: $(node --version 2>/dev/null || echo '使用默认')"
echo "   NPM: $(npm --version 2>/dev/null || echo '使用默认')"

echo ""
echo "📁 验证项目结构..."

# 确保在正确的目录
if [ ! -d "frontend" ]; then
    echo "❌ 错误: 找不到 frontend 目录"
    echo "当前目录内容:"
    ls -la
    exit 1
fi

echo "✅ 找到 frontend 目录"

# 进入前端目录
cd frontend
echo "📂 进入: $(pwd)"

echo ""
echo "📦 清理并安装依赖..."
# 清理可能的缓存
rm -rf node_modules/.vite 2>/dev/null || true

# 安装依赖
npm install --no-audit --no-fund --loglevel=error

echo ""
echo "🔨 开始构建..."
npm run build

echo ""
echo "✅ 构建完成!"
echo "📁 验证构建结果..."

# 检查关键文件
REQUIRED_FILES=("index.html" "assets/")
ALL_GOOD=true

for file in "${REQUIRED_FILES[@]}"; do
    if [ -e "dist/$file" ]; then
        echo "   ✅ dist/$file 存在"
    else
        echo "   ❌ dist/$file 不存在"
        ALL_GOOD=false
    fi
done

if $ALL_GOOD; then
    echo ""
    echo "🎉 构建验证通过!"
    echo ""
    echo "📊 构建统计:"
    echo "   文件数量: $(find dist -type f 2>/dev/null | wc -l)"
    echo "   总大小: $(du -sh dist 2>/dev/null | cut -f1 || echo '未知')"
    echo ""
    echo "📁 输出路径: $(pwd)/dist"
    echo "📁 相对路径: frontend/dist"
else
    echo ""
    echo "⚠️  构建验证失败"
    echo "当前 dist 目录内容:"
    ls -la dist/ 2>/dev/null || echo "dist 目录不存在"
    exit 1
fi

echo ""
echo "========================================"
echo "✅ 所有步骤完成！Cloudflare 可以部署了"
echo "========================================"