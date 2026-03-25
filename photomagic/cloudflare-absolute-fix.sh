#!/bin/bash

# Cloudflare Pages 绝对修复脚本
# 跳过所有可能的问题

echo "开始构建 PhotoMagic Studio..."

# 进入前端目录
if [ -d "photomagic/frontend" ]; then
    cd photomagic/frontend
elif [ -d "frontend" ]; then
    cd frontend
else
    echo "错误: 找不到前端目录"
    exit 1
fi

echo "当前目录: $(pwd)"

# 最简单的依赖安装
echo "安装依赖..."
npm install --silent

# 最简单的构建
echo "执行构建..."
npx vite build --silent

echo "构建完成!"
echo "输出目录: dist/"