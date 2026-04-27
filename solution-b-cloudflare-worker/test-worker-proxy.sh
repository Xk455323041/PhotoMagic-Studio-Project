#!/bin/bash

echo "=== Cloudflare Worker 代理测试脚本 ==="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

IMAGE_URL="result_604ee756d15441e3b4a6adbfa8d81671.png"
BACKEND_BASE="http://101.32.246.47:3002"
BACKEND_URL="$BACKEND_BASE/temp/$IMAGE_URL"

echo -e "${BLUE}🔍 当前状态检查${NC}"
echo ""

# 1. 检查后端服务
echo -e "${BLUE}1. 后端服务状态${NC}"
if curl -s "$BACKEND_BASE/api/v1/health" > /dev/null; then
    echo -e "  ${GREEN}✅ 后端服务运行正常${NC}"
else
    echo -e "  ${RED}❌ 后端服务异常${NC}"
    exit 1
fi

# 2. 检查图片文件
echo -e "\n${BLUE}2. 图片文件状态${NC}"
IMAGE_FILE="/root/.openclaw/workspace/photomagic/backend/temp/$IMAGE_URL"
if [ -f "$IMAGE_FILE" ]; then
    file_size=$(stat -c%s "$IMAGE_FILE")
    echo -e "  ${GREEN}✅ 图片文件存在${NC}"
    echo -e "    大小: $file_size 字节"
    echo -e "    类型: $(file -b "$IMAGE_FILE")"
else
    echo -e "  ${RED}❌ 图片文件不存在${NC}"
    exit 1
fi

# 3. 测试后端直接访问
echo -e "\n${BLUE}3. 后端直接访问测试${NC}"
backend_test=$(curl -sI "$BACKEND_URL" 2>/dev/null | head -1)
content_type=$(curl -sI "$BACKEND_URL" 2>/dev/null | grep -i "content-type" || echo "")
content_length=$(curl -sI "$BACKEND_URL" 2>/dev/null | grep -i "content-length" || echo "")

if echo "$backend_test" | grep -q "200 OK"; then
    echo -e "  ${GREEN}✅ 后端URL可访问${NC}"
    echo -e "    $content_type"
    echo -e "    $content_length"
else
    echo -e "  ${RED}❌ 后端URL不可访问${NC}"
fi

# 4. 测试Cloudflare Pages当前状态
echo -e "\n${BLUE}4. Cloudflare Pages当前状态${NC}"
CF_URL="https://photomagic-studio-project.pages.dev/temp/$IMAGE_URL"
cf_test=$(curl -sI "$CF_URL" 2>/dev/null | head -1)
cf_content_type=$(curl -sI "$CF_URL" 2>/dev/null | grep -i "content-type" || echo "")

if echo "$cf_test" | grep -q "200 OK"; then
    if echo "$cf_content_type" | grep -q "text/html"; then
        echo -e "  ${RED}❌ 返回HTML页面（需要Worker代理）${NC}"
        echo -e "    $cf_content_type"
    else
        echo -e "  ${GREEN}✅ 可能已配置代理${NC}"
    fi
else
    echo -e "  ${YELLOW}⚠️  访问异常${NC}"
fi

echo -e "\n${YELLOW}=== Cloudflare Worker 配置说明 ===${NC}"
echo ""
echo -e "${BLUE}🎯 Worker 部署步骤：${NC}"
echo "1. 登录 Cloudflare Dashboard (https://dash.cloudflare.com)"
echo "2. 进入 Workers & Pages → Create application → Create Worker"
echo "3. 命名Worker: photomagic-temp-proxy"
echo "4. 粘贴Worker代码（见下文）"
echo "5. 部署Worker"
echo "6. 配置路由: photomagic-studio-project.pages.dev/temp/*"
echo ""

echo -e "${BLUE}📋 Worker 代码：${NC}"
cat << 'EOF'
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    if (pathname.startsWith('/temp/')) {
      try {
        const filename = pathname.split('/temp/')[1];
        if (!filename) return new Response('Missing filename', { status: 400 });
        
        const backendUrl = `http://101.32.246.47:3002/temp/${filename}`;
        
        const headers = new Headers(request.headers);
        headers.delete('cf-connecting-ip');
        headers.delete('cf-ray');
        headers.set('Host', '101.32.246.47:3002');
        headers.set('X-Forwarded-For', request.headers.get('cf-connecting-ip') || '');
        headers.set('X-Forwarded-Proto', 'https');
        
        const backendRequest = new Request(backendUrl, {
          method: request.method,
          headers: headers,
          body: request.body,
          redirect: 'manual'
        });
        
        const response = await fetch(backendRequest);
        const responseHeaders = new Headers(response.headers);
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders
        });
      } catch (error) {
        return new Response(`Proxy error: ${error.message}`, { status: 502 });
      }
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
EOF

echo -e "\n${BLUE}🧪 测试命令：${NC}"
echo "部署完成后，运行以下命令测试："
echo "curl -I \"https://photomagic-studio-project.pages.dev/temp/$IMAGE_URL\""
echo "curl -o test.png \"https://photomagic-studio-project.pages.dev/temp/$IMAGE_URL\""
echo ""

echo -e "${BLUE}✅ 预期结果：${NC}"
echo "1. 状态码: 200 OK"
echo "2. Content-Type: image/png"
echo "3. 文件大小: 173,875 字节"
echo "4. 可以正常打开图片"
echo ""

echo -e "${GREEN}📝 备注：${NC}"
echo "• 后端服务: 正常运行"
echo "• 图片文件: 完整可用"
echo "• 清理策略: 7天保存期"
echo "• 直接访问: $BACKEND_URL"
echo ""

echo -e "${YELLOW}🚀 开始部署Cloudflare Worker吧！${NC}"