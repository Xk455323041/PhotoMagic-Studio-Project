#!/bin/bash

# Cloudflare Pages 部署脚本
# 使用方法: ./deploy-cloudflare.sh [environment]

set -e  # 遇到错误时退出

ENVIRONMENT=${1:-"production"}
PROJECT_NAME="photomagic-studio"

echo "🚀 开始部署 PhotoMagic Studio 到 Cloudflare Pages..."
echo "环境: $ENVIRONMENT"
echo "项目名称: $PROJECT_NAME"

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ 未找到 wrangler CLI，请先安装: npm install -g wrangler"
    exit 1
fi

# 登录 Cloudflare（如果需要）
if ! wrangler whoami &> /dev/null; then
    echo "🔐 请登录 Cloudflare..."
    wrangler login
fi

# 构建项目
echo "📦 构建项目..."
npm install
npm run build

# 部署到 Cloudflare Pages
echo "☁️ 部署到 Cloudflare Pages..."
if [ "$ENVIRONMENT" = "production" ]; then
    wrangler pages deploy dist --project-name=$PROJECT_NAME --branch=main
else
    wrangler pages deploy dist --project-name=$PROJECT_NAME
fi

echo "✅ 部署完成!"
echo "🌐 访问链接将在 Cloudflare Dashboard 中显示"