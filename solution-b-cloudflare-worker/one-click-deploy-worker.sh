#!/bin/bash

echo "========================================="
echo "  Cloudflare Worker 一键部署脚本"
echo "  方案B: 代理 /temp/* 请求到后端服务器"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查当前状态
echo -e "${BLUE}🔍 检查当前状态...${NC}"
echo ""

# 1. 检查后端服务
echo -e "${BLUE}1. 后端服务状态${NC}"
BACKEND_URL="http://101.32.246.47:3002/api/v1/health"
if curl -s "$BACKEND_URL" > /dev/null; then
    echo -e "  ${GREEN}✅ 后端服务运行正常${NC}"
else
    echo -e "  ${RED}❌ 后端服务异常${NC}"
    echo -e "  请确保后端服务在 101.32.246.47:3002 运行"
    exit 1
fi

# 2. 检查图片文件
echo -e "\n${BLUE}2. 测试图片状态${NC}"
TEST_IMAGE="result_604ee756d15441e3b4a6adbfa8d81671.png"
IMAGE_URL="http://101.32.246.47:3002/temp/$TEST_IMAGE"
if curl -sI "$IMAGE_URL" | grep -q "200 OK"; then
    echo -e "  ${GREEN}✅ 测试图片可访问${NC}"
    size=$(curl -sI "$IMAGE_URL" | grep -i "content-length" | cut -d' ' -f2 | tr -d '\r')
    echo -e "    文件大小: ${size:-未知} 字节"
else
    echo -e "  ${YELLOW}⚠️  测试图片不可访问${NC}"
    echo -e "  但Worker部署仍可继续"
fi

echo -e "\n${YELLOW}=========================================${NC}"
echo -e "${GREEN}         部署步骤说明${NC}"
echo -e "${YELLOW}=========================================${NC}"
echo ""

echo -e "${BLUE}🎯 方案B优势：${NC}"
echo "• 无需修改前端代码"
echo "• 无需重新部署前端应用"
echo "• 独立于前端部署"
echo "• 可单独监控和管理"
echo ""

echo -e "${BLUE}🔧 技术原理：${NC}"
echo "1. 创建Cloudflare Worker"
echo "2. 配置路由: photomagic-studio-project.pages.dev/temp/*"
echo "3. Worker将请求代理到后端服务器"
echo "4. 用户访问 Pages域名 → Worker → 后端服务器"
echo ""

echo -e "${BLUE}🚀 部署方法（二选一）：${NC}"
echo ""
echo -e "${YELLOW}方法A: Web界面部署（推荐）${NC}"
echo "1. 访问 https://dash.cloudflare.com"
echo "2. Workers & Pages → Create application → Create Worker"
echo "3. 名称: photomagic-temp-proxy"
echo "4. 粘贴Worker代码"
echo "5. 部署"
echo "6. 配置路由: photomagic-studio-project.pages.dev/temp/*"
echo ""
echo -e "${YELLOW}方法B: Wrangler CLI部署${NC}"
echo "1. 安装: npm install -g wrangler"
echo "2. 登录: wrangler login"
echo "3. 创建项目: wrangler generate photomagic-temp-proxy"
echo "4. 替换代码"
echo "5. 部署: wrangler deploy"
echo "6. 添加路由: wrangler route add photomagic-studio-project.pages.dev/temp/*"
echo ""

echo -e "${BLUE}📋 Worker代码位置：${NC}"
echo "文件: /root/.openclaw/workspace/cloudflare-worker-proxy-optimized.js"
echo "大小: $(stat -c%s /root/.openclaw/workspace/cloudflare-worker-proxy-optimized.js) 字节"
echo ""

echo -e "${BLUE}📝 核心代码片段：${NC}"
cat << 'EOF'
// 主要代理逻辑
if (pathname.startsWith('/temp/')) {
  const filename = pathname.substring(6);
  const backendUrl = `http://101.32.246.47:3002/temp/${filename}`;
  
  // 转发请求
  const response = await fetch(backendUrl, {
    method: request.method,
    headers: modifiedHeaders,
    body: request.body
  });
  
  // 返回响应
  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders
  });
}
EOF

echo ""
echo -e "${BLUE}🧪 部署后测试：${NC}"
echo "1. 等待部署完成（1-2分钟）"
echo "2. 测试URL:"
echo -e "   ${YELLOW}https://photomagic-studio-project.pages.dev/temp/result_604ee756d15441e3b4a6adbfa8d81671.png${NC}"
echo "3. 验证结果:"
echo "   • 状态码: 200 OK"
echo "   • Content-Type: image/png"
echo "   • 文件大小: 173,875 字节"
echo "   • 可以正常下载"
echo ""

echo -e "${BLUE}🔍 测试命令：${NC}"
cat << 'EOF'
# 测试后端直接访问
curl -I "http://101.32.246.47:3002/temp/result_604ee756d15441e3b4a6adbfa8d81671.png"

# 测试Worker代理（部署后）
curl -I "https://photomagic-studio-project.pages.dev/temp/result_604ee756d15441e3b4a6adbfa8d81671.png"

# 下载测试
curl -o test.png "https://photomagic-studio-project.pages.dev/temp/result_604ee756d15441e3b4a6adbfa8d81671.png"
ls -lh test.png
file test.png
EOF

echo ""
echo -e "${BLUE}📊 监控和维护：${NC}"
echo "• Worker日志: Cloudflare Dashboard → Workers"
echo "• 使用量: 注意免费额度（每日10万请求）"
echo "• 错误监控: 查看Worker错误日志"
echo "• 性能: 平均响应时间 < 500ms"
echo ""

echo -e "${BLUE}⚠️  注意事项：${NC}"
echo "1. 确保后端服务器可访问"
echo "2. 配置正确的路由规则"
echo "3. 测试CORS配置"
echo "4. 监控Worker配额使用"
echo "5. 定期检查后端服务状态"
echo ""

echo -e "${GREEN}✅ 准备就绪！${NC}"
echo ""
echo -e "${YELLOW}下一步操作：${NC}"
echo "1. 登录 Cloudflare Dashboard"
echo "2. 按照上述步骤部署Worker"
echo "3. 部署完成后运行测试"
echo "4. 验证图片下载功能"
echo ""
echo -e "${GREEN}🎯 方案B部署完成后，以下URL将正常工作：${NC}"
echo "https://photomagic-studio-project.pages.dev/temp/result_604ee756d15441e3b4a6adbfa8d81671.png"
echo ""

echo -e "${BLUE}📞 故障排除：${NC}"
echo "• 502错误: 检查后端服务"
echo "• 404错误: 检查路由配置"
echo "• CORS错误: 检查响应头"
echo "• 超时错误: 检查网络连接"
echo ""

echo -e "${GREEN}✨ 开始部署Cloudflare Worker吧！✨${NC}"